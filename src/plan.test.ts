import { describe, expect, it } from 'vitest';
import { newPlan, needsDayPrompt, parsePlan, reduceSession, suggestedCard, type Session } from './plan';

function fixture(): Session {
  const state: Session = { plan: newPlan(new Date(2026, 8, 25, 10)), current: null };
  state.plan.blocks.morning = ['a', 'b', 'c', 'd', 'e'].map(id => ({ id, name: id, status: 'pending' }));
  state.plan.blocks.afternoon = [{ id: 'f', name: 'f', status: 'pending' }];
  return state;
}
const select = (s: Session, id: string) => reduceSession(s, { type: 'select', id });
const complete = (s: Session, id: string) => reduceSession(select(s, id), { type: 'complete', id });

describe('execution', () => {
  it('switches the single current without completing skipped-over pending cards', () => {
    const state = select(select(fixture(), 'a'), 'd');
    expect(state.current).toBe('d');
    expect(state.plan.blocks.morning.every(card => card.status === 'pending')).toBe(true);
    expect(select(state, 'd').current).toBeNull();
  });
  it('completion clears current and never starts another block', () => {
    const state = complete(fixture(), 'e');
    expect(state.current).toBeNull(); expect(suggestedCard(state.plan)).toBeNull();
    expect(state.plan.lastCompletedBlockId).toBe('morning');
  });
  it('does not allow completing or skipping an unselected card', () => {
    const state = select(fixture(), 'a');
    expect(reduceSession(state, { type: 'complete', id: 'b' })).toBe(state);
    expect(reduceSession(state, { type: 'skip', id: 'b' })).toBe(state);
  });
  it.each(['complete', 'skip'] as const)('restores %s to pending without moving an existing current', type => {
    let state = reduceSession(select(fixture(), 'a'), { type, id: 'a' });
    state = select(state, 'b'); state = select(state, 'a');
    expect(state.current).toBe('b'); expect(state.plan.blocks.morning[0].status).toBe('pending');
    expect(select(state, 'a').current).toBe('a');
  });
  it('preserves current across moves and renames, clears it on deletion', () => {
    let state = select(fixture(), 'b');
    state = reduceSession(state, { type: 'move', id: 'b', target: { block: 'evening', beforeId: null } });
    state = reduceSession(state, { type: 'rename', id: 'b', name: '새 이름' });
    expect(state.current).toBe('b'); expect(state.plan.blocks.evening[0].name).toBe('새 이름');
    expect(reduceSession(state, { type: 'delete', id: 'b' }).current).toBeNull();
  });
});
describe('suggestions', () => {
  it('uses the lowest completed position, not the most recent completion time', () => {
    let state = complete(complete(fixture(), 'c'), 'a');
    expect(suggestedCard(state.plan)).toBe('d');
    state = reduceSession(select(state, 'd'), { type: 'skip', id: 'd' });
    expect(suggestedCard(state.plan)).toBeNull();
    state = select(state, 'd'); expect(suggestedCard(state.plan)).toBe('d');
    state = select(state, 'd'); expect(suggestedCard(state.plan)).toBe('d'); expect(state.current).toBe('d');
  });
  it('only uses the last completed block and does not follow moved completions', () => {
    let state = complete(fixture(), 'a');
    state = reduceSession(state, { type: 'move', id: 'a', target: { block: 'afternoon', beforeId: 'f' } });
    expect(suggestedCard(state.plan)).toBeNull(); expect(state.plan.lastCompletedBlockId).toBe('morning');
    state = complete(state, 'f'); expect(state.plan.lastCompletedBlockId).toBe('afternoon');
  });
  it('recalculates after completion undo and deletion', () => {
    let state = complete(complete(fixture(), 'a'), 'c');
    state = select(state, 'c'); expect(suggestedCard(state.plan)).toBe('b');
    state = reduceSession(state, { type: 'delete', id: 'a' }); expect(suggestedCard(state.plan)).toBeNull();
  });
});
describe('days and saved schema', () => {
  it('asks even for an empty day, remembers continue across restarts and dates', () => {
    const plan = newPlan(new Date(2026, 8, 25, 8));
    expect(needsDayPrompt(plan, new Date(2026, 8, 26, 5, 59))).toBe(false);
    expect(needsDayPrompt(plan, new Date(2026, 8, 26, 6))).toBe(true);
    const kept = reduceSession({ plan, current: null }, { type: 'keep' });
    expect(needsDayPrompt(parsePlan(kept.plan), new Date(2026, 9, 4, 8))).toBe(false);
    expect(needsDayPrompt(plan, new Date(2026, 8, 24, 8))).toBe(false);
  });
  it('resets directly to the current day, with no history and no current', () => {
    const state = reduceSession(complete(fixture(), 'a'), { type: 'reset', sameDay: false, date: new Date(2026, 9, 3, 3) });
    expect(state.plan.dayKey).toBe('2026-10-02'); expect(Object.values(state.plan.blocks).flat()).toEqual([]);
    expect(state.current).toBeNull(); expect(state.plan.lastCompletedBlockId).toBeNull(); expect(state.plan.keepPreviousDay).toBe(false);
  });
  it('clears the plan without changing its date when requested', () => {
    const state = reduceSession(fixture(), { type: 'reset', sameDay: true, date: new Date(2026, 9, 3, 8) });
    expect(state.plan.dayKey).toBe('2026-09-25');
  });
  it('roundtrips state while discarding transient and unknown fields', () => {
    const state = complete(fixture(), 'b');
    const decoded = parsePlan({ ...state.plan, current: 'a', extra: 'x' });
    expect(decoded).toEqual(state.plan); expect(decoded).not.toHaveProperty('current');
  });
  it.each([null, {}, { schemaVersion: 2 }, { ...newPlan(), dayKey: '2026-02-31' }, { ...newPlan(), blocks: {} }])('rejects corrupt or unsupported data %#', value => {
    expect(() => parsePlan(value)).toThrow();
  });
  it('rejects duplicate IDs and unknown statuses', () => {
    const state = fixture(); state.plan.blocks.morning[1].id = 'a'; expect(() => parsePlan(state.plan)).toThrow();
    expect(() => parsePlan({ ...newPlan(), blocks: { ...newPlan().blocks, morning: [{ id: 'x', name: 'x', status: 'current' }] } })).toThrow();
  });
});
