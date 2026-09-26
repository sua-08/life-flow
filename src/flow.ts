export const BLOCKS = [
  { id: 'morning', label: '오전', time: '06:00 – 12:00', symbol: '☀', description: '하루를 여는 작은 시작' },
  { id: 'afternoon', label: '오후', time: '12:00 – 18:00', symbol: '◒', description: '차근차근 이어가는 하루' },
  { id: 'evening', label: '저녁', time: '18:00 – 24:00', symbol: '◓', description: '나의 속도로 마무리하기' },
  { id: 'lateNight', label: '새벽', time: '00:00 – 06:00', symbol: '☾', description: '다음 날을 위한 조용한 시간' },
] as const;
export type BlockId = typeof BLOCKS[number]['id'];
export type CardStatus = 'pending' | 'completed' | 'skipped';
export interface FlowCard { id: string; name: string; status: CardStatus }
export type Flow = Record<BlockId, FlowCard[]>;
export const emptyFlow = (): Flow => ({ morning: [], afternoon: [], evening: [], lateNight: [] });

export interface DropTarget { block: BlockId; beforeId: string | null }

/** Commit only after a valid drop; the original objects (and statuses) survive. */
export function moveCard(flow: Flow, cardId: string, target: DropTarget | null): Flow {
  if (!target) return flow;
  const source = BLOCKS.find(block => flow[block.id].some(card => card.id === cardId))?.id;
  if (!source || target.beforeId === cardId) return flow;
  const card = flow[source].find(item => item.id === cardId)!;
  const destination = flow[target.block].filter(item => item.id !== cardId);
  const insertion = target.beforeId === null ? destination.length : destination.findIndex(item => item.id === target.beforeId);
  if (insertion < 0) return flow;
  destination.splice(insertion, 0, card);
  if (source === target.block && destination.every((item, index) => item === flow[source][index])) return flow;
  return { ...flow, [source]: flow[source].filter(item => item.id !== cardId), [target.block]: destination };
}

export function dayKey(date: Date): string {
  const local = new Date(date);
  if (local.getHours() < 6) local.setDate(local.getDate() - 1);
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
}
export function timeBlock(date: Date): BlockId {
  return BLOCKS[Math.floor(date.getHours() / 6) === 0 ? 3 : Math.floor(date.getHours() / 6) - 1].id;
}
export function validateName(raw: string): { name: string; error: string | null } {
  const name = raw.trim();
  if (!name) return { name, error: '할 일의 이름을 입력해 주세요.' };
  if ([...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(name)].length > 100) {
    return { name, error: '이름은 100자까지 입력할 수 있어요.' };
  }
  return { name, error: null };
}
