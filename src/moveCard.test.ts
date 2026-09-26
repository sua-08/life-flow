import { describe, expect, it } from 'vitest';
import { emptyFlow, moveCard, type Flow } from './flow';

function fixture(): Flow {
  return { ...emptyFlow(), morning: [
    { id: 'a', name: '같은 이름', status: 'pending' },
    { id: 'b', name: '같은 이름', status: 'completed' },
    { id: 'c', name: '산책', status: 'skipped' },
  ], afternoon: [{ id: 'd', name: '수업', status: 'pending' }] };
}
const ids = (flow: Flow) => flow.morning.map(card => card.id);
describe('card moves', () => {
  it('moves down and up in one block using insertion anchors', () => {
    const original = fixture();
    const down = moveCard(original, 'a', { block: 'morning', beforeId: 'c' });
    expect(ids(down)).toEqual(['b', 'a', 'c']);
    expect(ids(moveCard(down, 'c', { block: 'morning', beforeId: 'b' }))).toEqual(['c', 'b', 'a']);
    expect(ids(original)).toEqual(['a', 'b', 'c']);
  });
  it('appends and handles dropping at the unchanged position', () => {
    const original = fixture();
    expect(ids(moveCard(original, 'a', { block: 'morning', beforeId: null }))).toEqual(['b', 'c', 'a']);
    expect(moveCard(original, 'a', { block: 'morning', beforeId: 'b' })).toBe(original);
    expect(moveCard(original, 'c', { block: 'morning', beforeId: null })).toBe(original);
  });
  it.each(['a', 'b', 'c'])('preserves identity, name and status when moving %s across blocks', id => {
    const original = fixture();
    const card = original.morning.find(item => item.id === id);
    const moved = moveCard(original, id, { block: 'afternoon', beforeId: 'd' });
    expect(moved.afternoon[0]).toBe(card);
    expect(moved.morning.some(item => item.id === id)).toBe(false);
    expect(Object.values(moved).flat()).toHaveLength(4);
  });
  it('can move the last card to an empty block', () => {
    const moved = moveCard(fixture(), 'd', { block: 'lateNight', beforeId: null });
    expect(moved.afternoon).toEqual([]);
    expect(moved.lateNight.map(card => card.id)).toEqual(['d']);
  });
  it('cancellation and invalid anchors leave the original untouched', () => {
    const original = fixture();
    expect(moveCard(original, 'a', null)).toBe(original);
    expect(moveCard(original, 'missing', { block: 'evening', beforeId: null })).toBe(original);
    expect(moveCard(original, 'a', { block: 'morning', beforeId: 'a' })).toBe(original);
    expect(moveCard(original, 'a', { block: 'morning', beforeId: 'missing' })).toBe(original);
  });
});
