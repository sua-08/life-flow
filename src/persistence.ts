import { invoke, isTauri } from '@tauri-apps/api/core';
import type { SavedPlan } from './plan';

export interface Repository { load(): Promise<unknown | null>; save(plan: SavedPlan): Promise<void> }
export const desktop = isTauri();
export const repository: Repository = desktop ? {
  load: () => invoke('load_plan'),
  save: plan => invoke('save_plan', { plan }),
} : { load: async () => null, save: async () => undefined };

export interface SaveState { saving: boolean; dirty: boolean; error: string | null }
/** Serial writes prevent an older asynchronous response overwriting newer edits. */
export class SaveQueue {
  private latest: SavedPlan | null = null;
  private pending: SavedPlan | null = null;
  private task: Promise<void> | null = null;
  private saved: SavedPlan | null = null;
  private error: string | null = null;
  constructor(private write: Repository['save'], private notify: (state: SaveState) => void) {}
  enqueue(plan: SavedPlan) { this.latest = plan; this.pending = plan; this.start(); }
  private report() { this.notify({ saving: !!this.task, dirty: this.latest !== this.saved, error: this.error }); }
  private start() {
    if (this.task) { this.report(); return; }
    this.task = Promise.resolve().then(async () => {
      while (this.pending) {
        const snapshot = this.pending;
        this.pending = null;
        try { await this.write(snapshot); this.saved = snapshot; this.error = null; }
        catch (error) { this.error = String(error); }
      }
    }).finally(() => { this.task = null; this.report(); if (this.pending) this.start(); });
    this.report();
  }
  async flush(): Promise<boolean> {
    if (!this.task && this.latest !== this.saved && this.latest) { this.pending = this.latest; this.start(); }
    while (this.task) await this.task;
    return this.latest === this.saved;
  }
}
