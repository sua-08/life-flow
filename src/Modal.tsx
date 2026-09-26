import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ title, children, onCancel }: { title: string; children: ReactNode; onCancel?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); return () => ref.current?.close(); }, []);
  return <dialog ref={ref} className="delete-dialog" aria-label={title} onCancel={event => { event.preventDefault(); onCancel?.(); }}>
    <h2>{title}</h2>{children}
  </dialog>;
}
