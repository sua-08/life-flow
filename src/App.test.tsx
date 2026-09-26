// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newPlan, type SavedPlan } from './plan';

const mocks = vi.hoisted(() => ({ raw: null as unknown, failure: false, unreadable: false, writes: [] as unknown[], close: null as null | (() => Promise<void>), invoke: vi.fn(async () => {}) }));
vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => true, invoke: mocks.invoke }));
vi.mock('@tauri-apps/api/event', () => ({ listen: vi.fn(async (_event: string, callback: () => Promise<void>) => { mocks.close = callback; return () => {}; }) }));
vi.mock('./persistence', async importOriginal => {
  const actual = await importOriginal<typeof import('./persistence')>();
  return { ...actual, desktop: true, repository: {
    load: async () => { if (mocks.unreadable) throw new Error('bad json'); return mocks.raw; },
    save: async (plan: SavedPlan) => { if (mocks.failure) throw new Error('disk full'); mocks.writes.push(structuredClone(plan)); mocks.raw = structuredClone(plan); },
  } };
});
import App from './App';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 8, 25, 10));
  mocks.raw = null; mocks.failure = false; mocks.unreadable = false; mocks.writes = []; mocks.close = null; mocks.invoke.mockClear();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
async function start() { const result = render(<App />); await screen.findByRole('button', { name: '오전 카드 추가' }); return result; }
async function add(name: string) {
  fireEvent.click(screen.getByRole('button', { name: '오전 카드 추가' }));
  const input = await screen.findByLabelText('오전 새 할 일');
  fireEvent.change(input, { target: { value: name } }); fireEvent.keyDown(input, { key: 'Enter' });
}

describe('integrated execution and storage', () => {
  it('opens a temporary blank card from + and saves it only after a valid name is entered', async () => {
    await start();
    fireEvent.click(screen.getByRole('button', { name: '오전 카드 추가' }));
    const input = screen.getByLabelText('오전 새 할 일');
    expect(input).toBeTruthy(); expect((mocks.raw as SavedPlan).blocks.morning).toHaveLength(0);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByLabelText('오전 새 할 일')).toBeNull(); expect((mocks.raw as SavedPlan).blocks.morning).toHaveLength(0);
    await add('빈 카드에서 입력');
    await waitFor(() => expect((mocks.raw as SavedPlan).blocks.morning.map(card => card.name)).toEqual(['빈 카드에서 입력']));
  });
  it('does not offer destructive data reset when native lifecycle setup fails', async () => {
    mocks.raw = newPlan();
    mocks.invoke.mockRejectedValueOnce(new Error('listener setup unavailable'));
    render(<App />);
    await screen.findByRole('alert');
    expect(screen.queryByText('저장 데이터 초기화')).toBeNull();
    expect(screen.queryByRole('button', { name: '오전 카드 추가' })).toBeNull();
    expect(mocks.writes).toEqual([]);
  });
  it('completes without automatically selecting, restores completed state and suggestion after restart', async () => {
    const first = await start(); await add('아침'); await add('공부');
    fireEvent.click(screen.getByRole('button', { name: '아침' })); fireEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(screen.queryByText('지금 하는 일')).toBeNull();
    expect(screen.getByRole('button', { name: '공부, 다음 일 제안' })).toBeTruthy();
    await waitFor(() => expect((mocks.raw as SavedPlan).blocks.morning[0].status).toBe('completed'));
    first.unmount(); await start();
    expect(screen.getByRole('button', { name: '아침, 완료' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '공부, 다음 일 제안' })).toBeTruthy();
    expect(screen.queryByText('지금 하는 일')).toBeNull();
  });
  it('does not persist current and reverts skipped cards without switching existing current', async () => {
    const first = await start(); await add('아침'); await add('공부');
    fireEvent.click(screen.getByRole('button', { name: '아침' })); fireEvent.click(screen.getByRole('button', { name: '건너뛰기?' }));
    fireEvent.click(screen.getByRole('button', { name: '공부' })); fireEvent.click(screen.getByRole('button', { name: '아침, 건너뜀' }));
    expect(screen.getByRole('button', { name: '공부, 지금 하는 일' })).toBeTruthy();
    await waitFor(() => expect((mocks.raw as SavedPlan).blocks.morning[0].status).toBe('pending'));
    expect(mocks.raw).not.toHaveProperty('current');
    first.unmount(); await start(); expect(screen.queryByText('지금 하는 일')).toBeNull();
  });
  it('keeps a draft and current when the day boundary dialog is continued', async () => {
    await start(); await add('공부'); fireEvent.click(screen.getByRole('button', { name: '공부' }));
    fireEvent.click(screen.getByRole('button', { name: '오전 카드 추가' }));
    const input = screen.getByLabelText('오전 새 할 일') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '미완성 입력' } });
    vi.setSystemTime(new Date(2026, 8, 26, 6)); fireEvent.focus(window);
    await screen.findByRole('dialog', { name: '새 하루를 시작할까요?' });
    fireEvent.click(screen.getByRole('button', { name: '계속하기' }));
    expect(input.value).toBe('미완성 입력'); expect(screen.getByRole('button', { name: '공부, 지금 하는 일' })).toBeTruthy();
    await waitFor(() => expect((mocks.raw as SavedPlan).keepPreviousDay).toBe(true));
    vi.setSystemTime(new Date(2026, 8, 28, 6)); fireEvent.focus(window);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('asks for an empty previous day and resets directly to today with no second confirmation', async () => {
    mocks.raw = newPlan(new Date(2026, 8, 20, 8)); await start();
    expect(screen.getByRole('dialog', { name: '새 하루를 시작할까요?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '삭제하고 새 하루 시작' }));
    await waitFor(() => expect((mocks.raw as SavedPlan).dayKey).toBe('2026-09-25'));
    expect(screen.queryByRole('dialog')).toBeNull(); expect((mocks.raw as SavedPlan).keepPreviousDay).toBe(false);
  });
  it('does not overwrite unreadable or invalid data until explicit reset confirmation', async () => {
    mocks.unreadable = true; render(<App />);
    await screen.findByRole('dialog', { name: '저장 데이터를 불러올 수 없습니다' }); expect(mocks.writes).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '저장 데이터 초기화' })); expect(mocks.writes).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '삭제하고 초기화' }));
    await screen.findByRole('button', { name: '오전 카드 추가' }); await waitFor(() => expect(mocks.writes).toHaveLength(1));
  });
  it('keeps unsaved edits, offers return on close failure, and retries on the next change', async () => {
    await start(); await waitFor(() => expect(mocks.writes).toHaveLength(1)); mocks.failure = true;
    await add('저장 실패 카드'); await screen.findByRole('alert');
    await act(async () => { await mocks.close?.(); });
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeTruthy(); expect(mocks.invoke).not.toHaveBeenCalledWith('finish_exit');
    fireEvent.click(screen.getByRole('button', { name: '돌아가기' })); mocks.failure = false; await add('다음 변경');
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect((mocks.raw as SavedPlan).blocks.morning.map(card => card.name)).toEqual(['저장 실패 카드', '다음 변경']);
    await act(async () => { await mocks.close?.(); }); expect(mocks.invoke).toHaveBeenCalledWith('finish_exit');
  });
  it('outside edit click only cancels editing, without changing current', async () => {
    await start(); await add('아침'); await add('공부');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '아침' }));
    fireEvent.contextMenu(screen.getByRole('button', { name: '아침, 지금 하는 일' }));
    await user.click(screen.getByRole('menuitem', { name: '이름 변경' }));
    await user.click(screen.getByRole('button', { name: '공부' }));
    expect(screen.getByRole('button', { name: '아침, 지금 하는 일' })).toBeTruthy(); expect(screen.queryByLabelText('할 일 이름 변경')).toBeNull();
  });
});
