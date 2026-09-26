import { describe, expect, it, vi } from 'vitest';
import { SaveQueue, type SaveState } from './persistence';
import { newPlan, type SavedPlan } from './plan';

describe('serial persistence', () => {
  it('coalesces queued edits, never overlaps writes, and flush waits for the last snapshot', async () => {
    const writes: SavedPlan[] = [];
    let release!: () => void;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    const write = vi.fn(async (plan: SavedPlan) => { writes.push(plan); if (writes.length === 1) await barrier; });
    const queue = new SaveQueue(write, () => {});
    const first = newPlan(), second = { ...first, keepPreviousDay: true }, last = { ...first, dayKey: '2026-10-01' };
    queue.enqueue(first); await Promise.resolve(); queue.enqueue(second); queue.enqueue(last);
    expect(write).toHaveBeenCalledTimes(1);
    const flush = queue.flush(); release(); expect(await flush).toBe(true); expect(writes).toEqual([first, last]);
  });
  it('retains failed changes, reports failure, and retries the latest snapshot', async () => {
    let fail = true; let latest: SaveState | undefined;
    const write = vi.fn(async () => { if (fail) throw new Error('disk full'); });
    const queue = new SaveQueue(write, state => { latest = state; });
    queue.enqueue(newPlan()); expect(await queue.flush()).toBe(false);
    expect(latest?.dirty).toBe(true); expect(latest?.error).toContain('disk full');
    fail = false; expect(await queue.flush()).toBe(true); expect(latest).toEqual({ saving: false, dirty: false, error: null });
  });
  it('a later edit succeeds after an earlier failure without saving stale data last', async () => {
    const write = vi.fn< (plan: SavedPlan) => Promise<void> >().mockRejectedValueOnce(new Error('fail')).mockResolvedValue(undefined);
    const queue = new SaveQueue(write, () => {});
    queue.enqueue(newPlan()); expect(await queue.flush()).toBe(false);
    const latest = { ...newPlan(), keepPreviousDay: true }; queue.enqueue(latest);
    expect(await queue.flush()).toBe(true); expect(write).toHaveBeenLastCalledWith(latest);
  });
});
