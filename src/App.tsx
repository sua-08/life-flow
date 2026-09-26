import { useEffect, useRef, useState } from 'react';
import { BLOCKS, dayKey, type BlockId, type FlowCard } from './flow';
import { needsDayPrompt, suggestedCard } from './plan';
import { desktop } from './persistence';
import { usePlan } from './usePlan';
import { DraggableCard, DropList, FlowDrag } from './FlowDrag';
import { NameInput } from './NameInput';
import { Modal } from './Modal';
import { PixelMotif } from './PixelMotif';
import { PngSkin } from './PngSkin';
import panels from './assets/ui/panels.png';
import tape from './assets/ui/tape.png';
import lettering from './assets/ui/lettering.png';
import lateNightLettering from './assets/ui/late-night-lettering.png';

export default function App() {
  const session = usePlan();
  const { plan, current, dispatch, loaded, loadError, save } = session;
  const flow = plan.blocks;
  const [now, setNow] = useState(() => new Date());
  const [addingBlock, setAddingBlock] = useState<BlockId | null>(null);
  const [menu, setMenu] = useState<{ block: BlockId; card: FlowCard; x: number; y: number } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<FlowCard | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetCorrupt, setResetCorrupt] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cancelClick = useRef(false);
  const past = plan.dayKey < dayKey(now);
  const dayPrompt = loaded && needsDayPrompt(plan, now);
  const blocked = !loaded || !!loadError || dayPrompt || !!deleting || resetting || session.closing;
  const suggestion = suggestedCard(plan);

  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = window.setInterval(update, 1000);
    window.addEventListener('focus', update); document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const dismiss = () => setMenu(null);
    window.addEventListener('resize', dismiss); window.addEventListener('scroll', dismiss, true);
    return () => { window.removeEventListener('resize', dismiss); window.removeEventListener('scroll', dismiss, true); };
  }, [menu]);
  useEffect(() => { if (dayPrompt || session.closing) { setMenu(null); setAddingBlock(null); } }, [dayPrompt, session.closing]);

  function resetDay() {
    dispatch({ type: 'reset', date: new Date(), sameDay: plan.dayKey >= dayKey(new Date()) });
    setDeleting(null); setEditing(null); setMenu(null); setAddingBlock(null); setResetting(false);
  }
  function select(card: FlowCard) { if (!editing && !blocked && !menu) dispatch({ type: 'select', id: card.id }); }
  const total = Object.values(flow).reduce((sum, cards) => sum + cards.length, 0);
  const systemDateLabel = `TODAY: ${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${['일', '월', '화', '수', '목', '금', '토'][now.getDay()]}요일`;
  const systemTimeLabel = `현재 시각: ${now.getHours() < 12 ? 'AM' : 'PM'} ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (session.startupError) return <main className="loading-screen" role="alert">앱을 준비하지 못했습니다. 저장 데이터 초기화 없이 프로그램을 종료한 뒤 다시 실행해 주세요.</main>;
  if (!loaded && !loadError) return <main className="loading-screen" aria-busy="true">계획을 불러오는 중입니다…</main>;

  return <main className="app" onPointerDownCapture={event => {
    cancelClick.current = false;
    const target = event.target as Element;
    if (target.closest('dialog')) return;
    if (editing && !editRef.current?.contains(target)) {
      setEditing(null); cancelClick.current = true; event.preventDefault(); event.stopPropagation();
    }
    if (menu && !menuRef.current?.contains(target)) { setMenu(null); cancelClick.current = true; }
  }} onClickCapture={event => {
    if (cancelClick.current) { cancelClick.current = false; event.preventDefault(); event.stopPropagation(); }
  }} onKeyDown={event => {
    if (event.key === 'Escape' && !event.nativeEvent.isComposing && !(event.target as Element).closest('dialog')) { setMenu(null); setEditing(null); setAddingBlock(null); }
  }}>
    <PngSkin />
    <img src={panels} alt="" aria-hidden="true" className="panel-header-overlay panel-header-overlay-top" />
    <img src={panels} alt="" aria-hidden="true" className="panel-header-overlay panel-header-overlay-bottom" />
    <img src={tape} alt="" aria-hidden="true" className="tape-overlay" />
    <img src={lettering} alt="" aria-hidden="true" className="lettering-overlay" />
    <img src={lateNightLettering} alt="" aria-hidden="true" className="late-night-lettering-overlay" />
    <header className="app-header">
      <div className="brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" shapeRendering="crispEdges"><path d="M4 3h14v2h2v16H4Z" fill="var(--lf-blue)" stroke="currentColor"/><path d="M7 3v18M10 8h6M10 12h6M10 16h4" stroke="currentColor"/><path d="M17 2h3v7l-2-1-1 1Z" fill="var(--lf-pink)" stroke="currentColor"/></svg></span><div><h1>Life Flow<span className="brand-dot">.</span></h1><p>계획할 때 결정하고, 실행할 때는 흐름을 따라간다.</p></div></div>
      <span className="frame-caption" aria-hidden="true"><PixelMotif kind="flower" /> my little daily flow</span>
      <div className="date"><strong>{systemDateLabel}</strong><span>{systemTimeLabel}</span></div>
    </header>
    {save.error && <div className="save-warning" role="alert">저장되지 않았습니다. 종료하면 변경이 사라질 수 있어요. <button onClick={() => void session.retrySave()}>다시 저장</button></div>}
    <div className="section-heading"><div><span className="eyebrow">MY DAILY FLOW</span><h2>오늘의 흐름</h2></div><div className="plan-actions"><span className="count">{total}개의 할 일</span><button disabled={blocked} onClick={() => setResetting(true)}>{past ? '새 하루 시작' : '오늘 계획 비우기'}</button></div></div>
    <FlowDrag flow={flow} blocked={blocked} onStart={() => setMenu(null)} onMove={(id, target) => dispatch({ type: 'move', id, target })}>
    <section className="flow-grid" aria-label="하루의 네 구간" inert={blocked}>
      {BLOCKS.map((block, index) => <section className={'time-block block-' + block.id} key={block.id} aria-labelledby={'title-' + block.id}>
        <header className="block-header"><div className="block-title"><span className="block-symbol" aria-hidden="true"><PixelMotif kind={block.id} /></span><div><h3 id={'title-' + block.id}>{block.label}<span className="block-number">0{index + 1}</span></h3><p>{block.time}</p></div></div>
        </header>
        <DropList block={block.id} onScroll={() => setMenu(null)}>
          {!flow[block.id].length && addingBlock !== block.id && <button type="button" className="starter-card" aria-label={block.label + ' 첫 할 일 입력'} disabled={blocked || !!editing || !!menu} onClick={() => setAddingBlock(block.id)} />}
          <ol>{flow[block.id].map((card, cardIndex) => <li key={card.id}>
            <DraggableCard card={card} block={block.id} disabled={!!editing || blocked || !!menu} tabIndex={0}
              className={(current === card.id ? 'current-card ' : '') + (suggestion === card.id ? 'suggested-card' : '')}
              aria-label={card.name + (current === card.id ? ', 지금 하는 일' : '') + (suggestion === card.id ? ', 다음 일 제안' : '') + (card.status === 'completed' ? ', 완료' : card.status === 'skipped' ? ', 건너뜀' : '')}
              onClick={event => { if (!(event.target as Element).closest('button, input')) select(card); }}
              onContextMenu={event => {
                event.preventDefault(); if (editing || blocked) return;
                setMenu({ block: block.id, card, x: Math.max(8, Math.min(event.clientX, window.innerWidth - 180)), y: Math.max(8, Math.min(event.clientY, window.innerHeight - 110)) });
              }} onKeyDown={event => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(card); }
                if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                  event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect();
                  setMenu({ block: block.id, card, x: Math.min(rect.left + 30, window.innerWidth - 180), y: Math.min(rect.top, window.innerHeight - 110) });
                }
              }}>
              <span className="card-index">{String(cardIndex + 1).padStart(2, '0')}</span>
              {editing === card.id ? <div ref={editRef} className="edit-input"><NameInput label="할 일 이름 변경" initial={card.name} autoFocus onCancel={() => setEditing(null)} onSave={name => { dispatch({ type: 'rename', id: card.id, name }); setEditing(null); }} /></div>
                : <span className="card-name-wrap"><span className={'card-name ' + card.status} title={card.name}>{card.name}</span></span>}
              {current === card.id && <div className="execution-actions"><button className="complete-button" onClick={() => dispatch({ type: 'complete', id: card.id })}>완료</button><button className="skip-button" onClick={() => dispatch({ type: 'skip', id: card.id })}>건너뛰기?</button></div>}
            </DraggableCard>
            {cardIndex < flow[block.id].length - 1 && <div className="connector" aria-hidden="true">↓</div>}
          </li>)}{addingBlock === block.id && <li className="draft-card-row" data-add-draft>
            <div className="flow-card draft-card">
              <span className="card-index" aria-hidden="true">＋</span>
              <div className="edit-input"><NameInput label={block.label + ' 새 할 일'} placeholder="할 일을 입력하고 Enter" autoFocus
                onCancel={() => setAddingBlock(null)} onSave={name => { dispatch({ type: 'add', block: block.id, name, id: crypto.randomUUID() }); setAddingBlock(null); }} /></div>
            </div>
          </li>}</ol>
          <div className="add-row"><button type="button" className="add-card-button" aria-label={block.label + ' 카드 추가'} disabled={blocked || !!editing || !!menu}
            onClick={() => setAddingBlock(block.id)}><span aria-hidden="true" /></button></div>
        </DropList>
      </section>)}
    </section>
    </FlowDrag>
    <footer><span>클릭으로 지금 할 일 선택 · 드래그로 이동 · 우클릭으로 편집</span><span role="status">{!desktop ? '화면 미리보기 · 저장되지 않음' : save.error ? '저장 실패' : save.saving || save.dirty ? '저장 중…' : '저장됨'}</span></footer>
    {menu && !blocked && <div className="context-menu" ref={menuRef} role="menu" aria-label="카드 메뉴" style={{ left: menu.x, top: menu.y }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
        const active = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(active + (event.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length]?.focus();
      }
    }}><button role="menuitem" onClick={() => { setEditing(menu.card.id); setMenu(null); }}>이름 변경</button><button role="menuitem" className="danger" onClick={() => { setDeleting(menu.card); setMenu(null); }}>삭제</button></div>}

    {session.closing ? <Modal title={session.closeFailed ? '변경이 저장되지 않았습니다' : '저장을 마무리하고 있습니다'}>
      <p>{session.closeFailed ? '저장하지 않고 종료하면 최근 변경을 잃을 수 있습니다.' : '저장이 끝나면 프로그램이 종료됩니다.'}</p>
      {session.closeFailed && <div className="dialog-actions"><button autoFocus onClick={session.cancelClose}>돌아가기</button><button className="delete-confirm" onClick={() => void session.forceClose()}>저장하지 않고 종료</button></div>}
    </Modal> : loadError ? <Modal title="저장 데이터를 불러올 수 없습니다">
      <p>기존 파일을 변경하지 않았습니다. 초기화하면 기존 계획이 삭제됩니다.</p>
      {resetCorrupt ? <><p>정말 저장 데이터를 초기화할까요?</p><div className="dialog-actions"><button onClick={() => setResetCorrupt(false)}>취소</button><button className="delete-confirm" onClick={() => void session.resetCorrupt()}>삭제하고 초기화</button></div></> : <div className="dialog-actions"><button onClick={() => setResetCorrupt(true)}>저장 데이터 초기화</button></div>}
    </Modal> : dayPrompt ? <Modal title="새 하루를 시작할까요?">
      <p>오전 6시가 지났습니다. 새 하루를 시작하면 현재 카드와 기록이 모두 삭제됩니다.</p><div className="dialog-actions"><button autoFocus onClick={() => dispatch({ type: 'keep' })}>계속하기</button><button className="delete-confirm" onClick={resetDay}>삭제하고 새 하루 시작</button></div>
    </Modal> : resetting ? <Modal title={past ? '새 하루를 시작할까요?' : '오늘 계획을 비울까요?'} onCancel={() => setResetting(false)}>
      <p>현재 카드와 기록이 모두 삭제되며 되돌릴 수 없습니다.</p><div className="dialog-actions"><button autoFocus onClick={() => setResetting(false)}>취소</button><button className="delete-confirm" onClick={resetDay}>{past ? '삭제하고 새 하루 시작' : '삭제하고 비우기'}</button></div>
    </Modal> : deleting ? <Modal title="이 할 일을 삭제할까요?" onCancel={() => setDeleting(null)}>
      <p className="delete-name">{deleting.name}</p><p>삭제한 할 일은 되돌릴 수 없어요.</p><div className="dialog-actions"><button autoFocus onClick={() => setDeleting(null)}>취소</button><button className="delete-confirm" onClick={() => { dispatch({ type: 'delete', id: deleting.id }); setDeleting(null); }}>삭제</button></div>
    </Modal> : null}
  </main>;
}
