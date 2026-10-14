import { describe, expect, it } from 'bun:test';
import type { PopupPromoted } from '../src/admin/api/adminApi';
import {
  findShowingPopupId,
  getPopupDisplayStatus,
  getPopupScheduleStatus,
} from '../src/admin/features/popup-promoted/popupPromotedStatus';

function popup(overrides: Partial<PopupPromoted> = {}): PopupPromoted {
  return {
    id: overrides.id ?? 'popup-1',
    title: 'Open House',
    description: null,
    posterImagePath: null,
    posterImageAlt: null,
    buttonText: null,
    buttonUrl: null,
    targetType: null,
    targetId: null,
    openInNewTab: false,
    sortOrder: 0,
    isActive: true,
    activeFrom: null,
    activeUntil: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

const now = new Date('2026-10-14T08:00:00.000Z');

describe('getPopupScheduleStatus', () => {
  it('marks inactive popups as inactive even when the schedule window matches', () => {
    expect(getPopupScheduleStatus(popup({ isActive: false }), now).kind).toBe('inactive');
  });

  it('marks future active popups as scheduled', () => {
    expect(
      getPopupScheduleStatus(popup({ activeFrom: '2026-10-15T00:00:00.000Z' }), now).kind,
    ).toBe('scheduled');
  });

  it('marks ended active popups as expired', () => {
    expect(
      getPopupScheduleStatus(popup({ activeUntil: '2026-10-13T00:00:00.000Z' }), now).kind,
    ).toBe('expired');
  });
});

describe('getPopupDisplayStatus', () => {
  it('labels the first live popup as showing now', () => {
    expect(getPopupDisplayStatus(popup(), { isShowing: true, now }).label).toBe('Showing now');
  });

  it('labels live non-primary popups as queued', () => {
    expect(getPopupDisplayStatus(popup(), { isShowing: false, now }).label).toBe('Queued');
  });
});

describe('findShowingPopupId', () => {
  it('returns the first popup that is currently eligible', () => {
    const popups = [
      popup({ id: 'scheduled', activeFrom: '2026-10-15T00:00:00.000Z' }),
      popup({ id: 'showing' }),
      popup({ id: 'queued' }),
    ];

    expect(findShowingPopupId(popups, now)).toBe('showing');
  });
});
