import { createContext, useContext, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { DndContext, DragOverlay, PointerSensor, pointerWithin, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { BLOCKS, type BlockId, type DropTarget, type Flow, type FlowCard } from './flow';

const DragState = createContext<{ activeId: string | null; target: DropTarget | null }>({ activeId: null, target: null });

function findTarget(point: { x: number; y: number } | null, activeId: string): DropTarget | null {
  if (!point) return null;
  for (const { id } of BLOCKS) {
    const list = document.querySelector<HTMLElement>(`[data-drop-block="${id}"]`);
    if (!list) continue;
    const rect = list.getBoundingClientRect();
    if (point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom) continue;
    for (const card of list.querySelectorAll<HTMLElement>('[data-flow-card]')) {
      if (card.dataset.flowCard === activeId) continue;
      const bounds = card.getBoundingClientRect();
      if (point.y < bounds.top + bounds.height / 2) return { block: id, beforeId: card.dataset.flowCard! };
    }
    return { block: id, beforeId: null };
  }
  return null;
}

export function FlowDrag({ flow, onMove, onStart, children, blocked = false }: {
  flow: Flow; onMove: (id: string, target: DropTarget | null) => void; onStart: () => void; children: ReactNode; blocked?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const activeCard = activeId ? Object.values(flow).flat().find(card => card.id === activeId) : null;
  useEffect(() => {
    const track = (event: PointerEvent) => { pointer.current = { x: event.clientX, y: event.clientY }; };
    document.addEventListener('pointermove', track, true);
    document.addEventListener('pointerdown', track, true);
    document.addEventListener('pointerup', track, true);
    return () => {
      document.removeEventListener('pointermove', track, true);
      document.removeEventListener('pointerdown', track, true);
      document.removeEventListener('pointerup', track, true);
    };
  }, []);
  useEffect(() => {
    if (!activeId) return;
    let frame = 0;
    const update = () => {
      const next = findTarget(pointer.current, activeId);
      setTarget(previous => previous?.block === next?.block && previous?.beforeId === next?.beforeId ? previous : next);
      frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, [activeId]);
  const reset = () => { setActiveId(null); setTarget(null); };
  useEffect(() => { if (blocked) { setActiveId(null); setTarget(null); } }, [blocked]);
  return <DndContext sensors={sensors} collisionDetection={pointerWithin}
    onDragStart={event => { setActiveId(String(event.active.id)); onStart(); }}
    onDragCancel={reset}
    onDragEnd={event => { if (!blocked && activeId) onMove(String(event.active.id), findTarget(pointer.current, String(event.active.id))); reset(); }}
    accessibility={{
      screenReaderInstructions: { draggable: '카드를 마우스로 끌어 이동하세요. Escape를 누르면 이동을 취소합니다.' },
      announcements: {
        onDragStart: () => '카드 이동을 시작합니다.',
        onDragOver: ({ over }) => over ? '이 구간에 카드를 놓을 수 있습니다.' : '이동할 구간으로 카드를 끌어 주세요.',
        onDragCancel: () => '카드 이동을 취소했습니다.',
        onDragEnd: () => '카드 이동을 종료했습니다.',
      },
    }}>
    <DragState.Provider value={{ activeId, target }}>{children}</DragState.Provider>
    <DragOverlay dropAnimation={null}>{activeCard && <div className="flow-card drag-preview" aria-hidden="true"><span className={`card-name ${activeCard.status}`}>{activeCard.name}</span></div>}</DragOverlay>
  </DndContext>;
}

export function DropList({ block, children, onScroll }: { block: BlockId; children: ReactNode; onScroll: () => void }) {
  const { setNodeRef } = useDroppable({ id: block });
  const { activeId, target } = useContext(DragState);
  return <div ref={setNodeRef} data-drop-block={block} className={`card-list${activeId && target?.block === block ? ' drop-active' : ''}`} onScroll={onScroll}>
    {children}
    {target?.block === block && target.beforeId === null && <div className="drop-line drop-at-end" aria-hidden="true" />}
  </div>;
}

export function DraggableCard({ card, block, disabled, children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & {
  card: FlowCard; block: BlockId; disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id, disabled });
  const { target } = useContext(DragState);
  return <div ref={setNodeRef} {...attributes} {...props} data-flow-card={card.id}
    className={`flow-card draggable-card ${className}${isDragging ? ' is-dragging' : ''}${target?.block === block && target.beforeId === card.id ? ' drop-before' : ''}`}
    onPointerDown={event => {
      if ((event.target as Element).closest('input, button, textarea, select, [contenteditable="true"], [role="menu"]')) return;
      listeners?.onPointerDown?.(event);
    }}>
    {children}
  </div>;
}
