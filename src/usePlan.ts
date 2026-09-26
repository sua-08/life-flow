import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { newPlan, parsePlan, reduceSession, type Action, type Session } from './plan';
import { desktop, repository, SaveQueue, type SaveState } from './persistence';

export function usePlan() {
  const [session, setSession] = useState<Session>({ plan: newPlan(), current: null });
  const current = useRef(session);
  const [loaded, setLoaded] = useState(false);
  const [lifecycleReady, setLifecycleReady] = useState(!desktop);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>({ saving: false, dirty: false, error: null });
  const [closing, setClosing] = useState(false);
  const [closeFailed, setCloseFailed] = useState(false);
  const closeInFlight = useRef(false);
  const queue = useRef<SaveQueue | null>(null);
  if (!queue.current) queue.current = new SaveQueue(repository.save, setSave);
  const loadPromise = useRef<Promise<unknown | null> | null>(null);
  useEffect(() => {
    let live = true;
    loadPromise.current ??= repository.load();
    void loadPromise.current.then(raw => {
      if (!live) return;
      const plan = raw === null ? newPlan() : parsePlan(raw);
      current.current = { plan, current: null }; setSession(current.current); setLoaded(true);
      if (raw === null) queue.current!.enqueue(plan);
    }).catch(error => { if (live) setLoadError(String(error)); });
    return () => { live = false; };
  }, []);
  useEffect(() => {
    if (!desktop) return;
    let live = true;
    const unlisten = listen('life-flow-close', async () => {
      if (closeInFlight.current) return;
      closeInFlight.current = true; setClosing(true);
      try {
        if (await queue.current!.flush()) await invoke('finish_exit');
        else setCloseFailed(true);
      } catch { setCloseFailed(true); }
    });
    void unlisten.then(async stop => {
      if (!live) { stop(); return; }
      await invoke('frontend_ready');
      if (live) setLifecycleReady(true);
    }).catch(error => { if (live) setStartupError('종료 보호를 준비하지 못했습니다: ' + String(error)); });
    return () => { live = false; void unlisten.then(stop => stop()).catch(() => undefined); };
  }, []);
  function dispatch(action: Action) {
    if (!loaded || closeInFlight.current) return;
    const next = reduceSession(current.current, action);
    if (next === current.current) return;
    if (next.plan !== current.current.plan) queue.current!.enqueue(next.plan);
    current.current = next; setSession(next);
  }
  async function resetCorrupt() {
    const plan = newPlan();
    queue.current!.enqueue(plan);
    if (await queue.current!.flush()) {
      current.current = { plan, current: null }; setSession(current.current); setLoadError(null); setLoaded(true);
    }
  }
  return { ...session, dispatch, loaded: loaded && lifecycleReady, loadError, startupError, save, closing, closeFailed, resetCorrupt,
    retrySave: () => queue.current!.flush(),
    cancelClose: () => { closeInFlight.current = false; setClosing(false); setCloseFailed(false); },
    forceClose: () => invoke('finish_exit'),
  };
}
