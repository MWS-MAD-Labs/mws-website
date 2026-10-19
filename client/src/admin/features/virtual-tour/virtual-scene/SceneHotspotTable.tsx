import { Pencil, Trash2 } from 'lucide-react';
import type { VirtualTourScene } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import type { HotspotRow } from './sceneEditorModel';

type SceneHotspotTableProps = {
  hotspots: HotspotRow[];
  isSaving: boolean;
  targetScenes: VirtualTourScene[];
  onDelete: (hotspot: HotspotRow) => void;
  onEdit: (hotspot: HotspotRow) => void;
};

export default function SceneHotspotTable({
  hotspots,
  isSaving,
  targetScenes,
  onDelete,
  onEdit,
}: SceneHotspotTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
      <div className="border-b border-[#E2E8F0] px-5 py-4">
        <h2 className="font-semibold text-[#1C2434]">Hotspots</h2>
        <p className="mt-1 text-sm text-[#64748B]">Navigation points configured for this scene.</p>
      </div>
      {!hotspots.length ? (
        <div className="p-8 text-center text-sm text-[#64748B]">No hotspots yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase text-[#475569]">
              <tr>
                <th className="px-5 py-3">Leads to</th>
                <th className="px-5 py-3">Label</th>
                <th className="px-5 py-3">Yaw</th>
                <th className="px-5 py-3">Pitch</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {hotspots.map((hotspot) => {
                const target = targetScenes.find((scene) => scene.id === hotspot.toSceneId);

                return (
                  <tr key={hotspot.id}>
                    <td className="px-5 py-3 font-medium text-[#1C2434]">
                      {target?.name ?? 'Unknown scene'}
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">{hotspot.label || '-'}</td>
                    <td className="px-5 py-3 tabular-nums text-[#64748B]">{hotspot.yaw}°</td>
                    <td className="px-5 py-3 tabular-nums text-[#64748B]">{hotspot.pitch}°</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label="Edit hotspot"
                          className="h-11 w-11"
                          disabled={isSaving}
                          iconOnly
                          size="sm"
                          title="Edit hotspot"
                          variant="ghost"
                          onClick={() => onEdit(hotspot)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          aria-label="Delete hotspot"
                          className="h-11 w-11"
                          disabled={isSaving}
                          iconOnly
                          size="sm"
                          title="Delete hotspot"
                          variant="ghost"
                          onClick={() => onDelete(hotspot)}
                        >
                          <Trash2 className="text-[#DC2626]" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
