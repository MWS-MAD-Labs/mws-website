import type { PopupPromoted } from '../../api/adminApi';

export type PopupScheduleStatusKind = 'inactive' | 'scheduled' | 'expired' | 'live';

type PopupScheduleStatus = {
  className: string;
  description: string;
  kind: PopupScheduleStatusKind;
  label: string;
  searchText: string;
};

const STATUS_STYLE = {
  expired: 'bg-[#FEF3C7] text-[#92400E]',
  inactive: 'bg-[#F1F5F9] text-[#64748B]',
  live: 'bg-[#DCFCE7] text-[#166534]',
  queued: 'bg-[#E0F2FE] text-[#0369A1]',
  scheduled: 'bg-[#EDE9FE] text-[#6D28D9]',
};

function readDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getPopupScheduleStatus(
  popup: Pick<PopupPromoted, 'activeFrom' | 'activeUntil' | 'isActive'>,
  now = new Date(),
): PopupScheduleStatus {
  if (!popup.isActive) {
    return {
      className: STATUS_STYLE.inactive,
      description: 'Turned off in CMS.',
      kind: 'inactive',
      label: 'Inactive',
      searchText: 'inactive hidden off',
    };
  }

  const activeFrom = readDate(popup.activeFrom);
  if (activeFrom && activeFrom > now) {
    return {
      className: STATUS_STYLE.scheduled,
      description: 'Will become eligible at the scheduled start time.',
      kind: 'scheduled',
      label: 'Scheduled',
      searchText: 'scheduled upcoming active later',
    };
  }

  const activeUntil = readDate(popup.activeUntil);
  if (activeUntil && activeUntil < now) {
    return {
      className: STATUS_STYLE.expired,
      description: 'The scheduled end time has passed.',
      kind: 'expired',
      label: 'Expired',
      searchText: 'expired ended inactive',
    };
  }

  return {
    className: STATUS_STYLE.live,
    description: 'Inside the active schedule window.',
    kind: 'live',
    label: 'Eligible',
    searchText: 'eligible active live',
  };
}

export function getPopupDisplayStatus(
  popup: Pick<PopupPromoted, 'activeFrom' | 'activeUntil' | 'isActive'>,
  options: { isShowing: boolean; now?: Date },
): PopupScheduleStatus {
  const scheduleStatus = getPopupScheduleStatus(popup, options.now ?? new Date());

  if (scheduleStatus.kind !== 'live') return scheduleStatus;

  if (options.isShowing) {
    return {
      ...scheduleStatus,
      description: 'This is the first eligible popup and is visible on the public site.',
      label: 'Showing now',
      searchText: `${scheduleStatus.searchText} showing visible current`,
    };
  }

  return {
    ...scheduleStatus,
    className: STATUS_STYLE.queued,
    description: 'Eligible, but another popup with higher priority is showing first.',
    label: 'Queued',
    searchText: `${scheduleStatus.searchText} queued standby`,
  };
}

export function findShowingPopupId(popups: PopupPromoted[], now = new Date()) {
  return popups.find((popup) => getPopupScheduleStatus(popup, now).kind === 'live')?.id ?? null;
}
