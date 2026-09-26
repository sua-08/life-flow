import type { BlockId } from './flow';

/** Original tiny grid drawings; decorative and independent of hit targets. */
export function PixelMotif({ kind }: { kind: BlockId | 'flower' | 'star' }) {
  const drawings = {
    morning: <><path d="M6 4h4v2h2v4h-2v2H6v-2H4V6h2Z" fill="var(--lf-butter)" stroke="currentColor"/><path d="M7 0h2v2H7zM7 14h2v2H7zM0 7h2v2H0zM14 7h2v2h-2zM2 2h2v2H2zM12 2h2v2h-2zM2 12h2v2H2zM12 12h2v2h-2z" fill="currentColor"/></>,
    afternoon: <><path d="M8 2h4v4H8z" fill="var(--lf-butter)"/><path d="M3 7V5h5v2h4v2h2v4H2V9H1V7Z" fill="var(--lf-blue)" stroke="currentColor"/></>,
    evening: <><path d="M5 6V4h6v2h2v5H3V6Z" fill="var(--lf-pink)" stroke="currentColor"/><path d="M1 11h14M3 14h10M7 0h2" stroke="currentColor"/></>,
    lateNight: <path d="M5 1h5V3H7v5h2v2h5v3h-2v2H5v-2H3V4h2Z" fill="var(--lf-butter)" stroke="currentColor"/>,
    flower: <><path d="M6 1h4v4h4v5h-4v4H5v-4H1V5h5Z" fill="var(--lf-pink)" stroke="currentColor"/><path d="M6 6h4v4H6Z" fill="var(--lf-butter)"/></>,
    star: <path d="M7 1h2v4h4v2h2v2h-4v4H9v2H7v-4H3V9H1V7h4V3h2Z" fill="var(--lf-butter)" stroke="currentColor"/>,
  };
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" shapeRendering="crispEdges" className="pixel-motif">{drawings[kind]}</svg>;
}
