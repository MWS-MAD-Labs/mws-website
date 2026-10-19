import { Images, Pencil, Route, Trash2 } from 'lucide-react';
import type { VirtualTourListItem } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import StatusBadge from '@/admin/components/ui/StatusBadge';
import { formatAdminDateTime } from '@/admin/utils/dateFormat';

type Props = {
  deletingId: string | null;
  tours: VirtualTourListItem[];
  onDelete: (tour: VirtualTourListItem) => void;
  onEdit: (tour: VirtualTourListItem) => void;
  onManage: (tour: VirtualTourListItem) => void;
};

export default function VirtualTourTable({ deletingId, tours, onDelete, onEdit, onManage }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[940px] text-left">
        <thead className="border-b border-[#E2E8F0] bg-white">
          <tr>
            {['Tour', 'Slug', 'Scenes', 'Start scene', 'Status', 'Updated', 'Actions'].map(
              (label) => (
                <th
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]"
                  key={label}
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {tours.map((tour) => (
            <tr className="transition-colors hover:bg-[#F8FAFC]" key={tour.id}>
              <td className="px-5 py-4 align-top">
                <p className="font-semibold text-[#1C2434]">{tour.title}</p>
                <p className="mt-1 max-w-[300px] truncate text-sm text-[#64748B]">
                  {tour.description || 'No description'}
                </p>
              </td>
              <td className="px-5 py-4 align-top text-sm text-[#475569]">{tour.slug}</td>
              <td className="px-5 py-4 align-top">
                <span className="inline-flex items-center gap-1.5 text-sm text-[#475569]">
                  <Images size={15} /> {tour._count.scenes}
                </span>
              </td>
              <td className="px-5 py-4 align-top text-sm text-[#64748B]">
                {tour.startScene?.name ?? '-'}
              </td>
              <td className="px-5 py-4 align-top">
                <StatusBadge status={tour.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-[#64748B]">
                {formatAdminDateTime(tour.updatedAt)}
              </td>
              <td className="px-5 py-4 align-top">
                <div className="flex justify-end gap-1">
                  <Button
                    aria-label={`Manage scenes for ${tour.title}`}
                    className="h-11 w-11"
                    iconOnly
                    size="sm"
                    title="Manage scenes"
                    variant="ghost"
                    onClick={() => onManage(tour)}
                  >
                    <Route size={16} />
                  </Button>
                  <Button
                    aria-label={`Edit ${tour.title}`}
                    className="h-11 w-11"
                    iconOnly
                    size="sm"
                    title="Edit tour"
                    variant="ghost"
                    onClick={() => onEdit(tour)}
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    aria-label={`Delete ${tour.title}`}
                    className="h-11 w-11"
                    disabled={deletingId === tour.id}
                    iconOnly
                    size="sm"
                    title="Delete tour"
                    variant="ghost"
                    onClick={() => onDelete(tour)}
                  >
                    <Trash2 className="text-[#DC2626]" size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
