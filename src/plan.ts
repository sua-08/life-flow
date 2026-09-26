import { BLOCKS, dayKey, emptyFlow, moveCard, validateName, type BlockId, type DropTarget, type Flow } from './flow';

export interface SavedPlan {
  schemaVersion: 1;
  dayKey: string;
  blocks: Flow;
  lastCompletedBlockId: BlockId | null;
  keepPreviousDay: boolean;
}
export interface Session { plan: SavedPlan; current: string | null }
export const newPlan = (date = new Date()): SavedPlan => ({ schemaVersion: 1, dayKey: dayKey(date), blocks: emptyFlow(), lastCompletedBlockId: null, keepPreviousDay: false });
const isBlock = (value: unknown): value is BlockId => BLOCKS.some(block => block.id === value);
export function parsePlan(value: unknown): SavedPlan {
  if (!value || typeof value !== 'object') throw new Error('저장 데이터 형식을 확인할 수 없습니다.');
  const plan = value as SavedPlan;
  if (plan.schemaVersion !== 1 || typeof plan.dayKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(plan.dayKey)) throw new Error('지원하지 않는 저장 형식입니다.');
  const parsedDate = new Date(`${plan.dayKey}T12:00:00`);
  if (!Number.isFinite(parsedDate.getTime()) || dayKey(parsedDate) !== plan.dayKey) throw new Error('저장된 날짜가 올바르지 않습니다.');
  if (typeof plan.keepPreviousDay !== 'boolean' || (plan.lastCompletedBlockId !== null && !isBlock(plan.lastCompletedBlockId)) || !plan.blocks) throw new Error('저장된 상태가 올바르지 않습니다.');
  const ids = new Set<string>();
  const blocks = emptyFlow();
  for (const { id } of BLOCKS) {
    if (!Array.isArray(plan.blocks[id])) throw new Error('저장된 구간이 누락되었습니다.');
    blocks[id] = plan.blocks[id].map(card => {
      if (!card || typeof card.id !== 'string' || !card.id || ids.has(card.id) || typeof card.name !== 'string' || validateName(card.name).error || card.name !== card.name.trim() || !['pending', 'completed', 'skipped'].includes(card.status)) throw new Error('저장된 카드가 올바르지 않습니다.');
      ids.add(card.id);
      return { id: card.id, name: card.name, status: card.status };
    });
  }
  // Whitelist fields: current and other transient state can never be restored.
  return { schemaVersion: 1, dayKey: plan.dayKey, blocks, lastCompletedBlockId: plan.lastCompletedBlockId, keepPreviousDay: plan.keepPreviousDay };
}
export type Action =
  | { type: 'add'; block: BlockId; name: string; id: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'delete' | 'select' | 'complete' | 'skip'; id: string }
  | { type: 'move'; id: string; target: DropTarget | null }
  | { type: 'keep' }
  | { type: 'reset'; date: Date; sameDay: boolean };

export function reduceSession(state: Session, action: Action): Session {
  const { plan } = state;
  if (action.type === 'reset') return { plan: { ...newPlan(action.date), dayKey: action.sameDay ? plan.dayKey : dayKey(action.date) }, current: null };
  if (action.type === 'keep') return { ...state, plan: { ...plan, keepPreviousDay: true } };
  if (action.type === 'add') {
    const name = validateName(action.name);
    if (name.error || Object.values(plan.blocks).flat().some(card => card.id === action.id)) return state;
    return { ...state, plan: { ...plan, blocks: { ...plan.blocks, [action.block]: [...plan.blocks[action.block], { id: action.id, name: name.name, status: 'pending' }] } } };
  }
  if (action.type === 'move') {
    const blocks = moveCard(plan.blocks, action.id, action.target);
    return blocks === plan.blocks ? state : { ...state, plan: { ...plan, blocks } };
  }
  const block = BLOCKS.find(({ id }) => plan.blocks[id].some(card => card.id === action.id))?.id;
  if (!block) return state;
  const card = plan.blocks[block].find(item => item.id === action.id)!;
  if (action.type === 'select' && card.status === 'pending') return { ...state, current: state.current === card.id ? null : card.id };
  if ((action.type === 'complete' || action.type === 'skip') && state.current !== card.id) return state;
  let replacement = card;
  if (action.type === 'rename') {
    const name = validateName(action.name);
    if (name.error || name.name === card.name) return state;
    replacement = { ...card, name: name.name };
  } else if (action.type === 'select') replacement = { ...card, status: 'pending' };
  else if (action.type === 'complete') replacement = { ...card, status: 'completed' };
  else if (action.type === 'skip') replacement = { ...card, status: 'skipped' };
  const cards = action.type === 'delete' ? plan.blocks[block].filter(item => item.id !== card.id) : plan.blocks[block].map(item => item.id === card.id ? replacement : item);
  return {
    current: ['delete', 'complete', 'skip'].includes(action.type) && state.current === card.id ? null : state.current,
    plan: { ...plan, blocks: { ...plan.blocks, [block]: cards }, lastCompletedBlockId: action.type === 'complete' ? block : plan.lastCompletedBlockId },
  };
}
export function suggestedCard(plan: SavedPlan): string | null {
  const cards = plan.lastCompletedBlockId ? plan.blocks[plan.lastCompletedBlockId] : [];
  let last = -1;
  cards.forEach((card, index) => { if (card.status === 'completed') last = index; });
  const next = last >= 0 ? cards[last + 1] : null;
  return next?.status === 'pending' ? next.id : null;
}
export const needsDayPrompt = (plan: SavedPlan, date: Date) => plan.dayKey < dayKey(date) && !plan.keepPreviousDay;
