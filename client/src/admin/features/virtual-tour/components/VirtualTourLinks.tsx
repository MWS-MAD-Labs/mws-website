import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type {
  VirtualTourLink,
  VirtualTourLinkPayload,
  VirtualTourScene,
} from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';
import { FIELD_CLASS, optionalText } from '../virtualTourUtils';

type Props = {
  isSaving: boolean;
  scene: VirtualTourScene;
  scenes: VirtualTourScene[];
  onBack: () => void;
  onDelete: (link: VirtualTourLink) => void;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (link: VirtualTourLink | null, payload: VirtualTourLinkPayload) => Promise<boolean>;
};

type LinkForm = {
  toSceneId: string;
  label: string;
  yaw: string;
  pitch: string;
  sortOrder: string;
};

const emptyForm: LinkForm = { toSceneId: '', label: '', yaw: '0', pitch: '0', sortOrder: '0' };

export default function VirtualTourLinks({
  isSaving,
  scene,
  scenes,
  onBack,
  onDelete,
  onDirtyChange,
  onSave,
}: Props) {
  const [editingLink, setEditingLink] = useState<VirtualTourLink | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<LinkForm>(emptyForm);
  const [isDirty, setIsDirty] = useState(false);
  const targets = scenes.filter((item) => item.id !== scene.id);

  function openCreate() {
    setEditingLink(null);
    setForm({ ...emptyForm, toSceneId: targets[0]?.id ?? '' });
    setFormOpen(true);
    setIsDirty(false);
    onDirtyChange(false);
  }

  function openEdit(link: VirtualTourLink) {
    setEditingLink(link);
    setForm({
      toSceneId: link.toSceneId,
      label: link.label ?? '',
      yaw: String(link.yaw),
      pitch: String(link.pitch),
      sortOrder: String(link.sortOrder),
    });
    setFormOpen(true);
    setIsDirty(false);
    onDirtyChange(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSave(editingLink, {
      toSceneId: form.toSceneId,
      label: optionalText(form.label),
      yaw: Number(form.yaw),
      pitch: Number(form.pitch),
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
    });
    if (saved) {
      setFormOpen(false);
      setIsDirty(false);
      onDirtyChange(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button aria-label="Back to scenes" className="h-11 w-11" iconOnly size="sm" variant="outline" onClick={onBack}>
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-[#1C2434]">Links from {scene.name}</h3>
            <p className="text-sm text-[#64748B]">
              Place navigation hotspots using yaw and pitch coordinates.
            </p>
          </div>
        </div>
        <Button disabled={isSaving || !targets.length} size="sm" onClick={openCreate}>
          <Plus size={15} /> Add link
        </Button>
      </div>

      {!targets.length ? (
        <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
          <p className="font-medium text-[#1C2434]">Another scene is required.</p>
          <p className="mt-1 text-sm text-[#64748B]">Create a destination scene before adding a link.</p>
        </div>
      ) : null}

      {formOpen ? (
        <form
          className="grid gap-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4"
          onChange={() => {
            setIsDirty(true);
            onDirtyChange(true);
          }}
          onSubmit={submit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Destination scene" required>
              <Select
                disabled={isSaving}
                required
                value={form.toSceneId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, toSceneId: event.target.value }))
                }
              >
                <option value="">Select destination</option>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.name}{target.isActive ? '' : ' (inactive)'}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Label">
              <input
                className={FIELD_CLASS}
                disabled={isSaving}
                maxLength={255}
                placeholder="Example: Go to corridor"
                value={form.label}
                onChange={(event) =>
                  setForm((current) => ({ ...current, label: event.target.value }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Yaw" hint="-180 to 180 degrees" optional={false}>
              <input className={FIELD_CLASS} disabled={isSaving} max={180} min={-180} required step="0.1" type="number" value={form.yaw} onChange={(event) => setForm((current) => ({ ...current, yaw: event.target.value }))} />
            </Field>
            <Field label="Pitch" hint="-90 to 90 degrees" optional={false}>
              <input className={FIELD_CLASS} disabled={isSaving} max={90} min={-90} required step="0.1" type="number" value={form.pitch} onChange={(event) => setForm((current) => ({ ...current, pitch: event.target.value }))} />
            </Field>
            <Field label="Sort order" optional={false}>
              <input className={FIELD_CLASS} disabled={isSaving} required type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              disabled={isSaving}
              size="sm"
              variant="outline"
              onClick={() => {
                if (isDirty && !window.confirm('Discard unsaved link changes?')) return;
                setFormOpen(false);
                setIsDirty(false);
                onDirtyChange(false);
              }}
            >
              Cancel
            </Button>
            <Button disabled={isSaving || !form.toSceneId} size="sm" type="submit">
              {isSaving ? 'Saving...' : editingLink ? 'Update link' : 'Create link'}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
        {!scene.outgoingLinks.length ? (
          <div className="p-8 text-center text-sm text-[#64748B]">No links from this scene yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#F1F5F9] text-xs font-semibold uppercase text-[#475569]">
                <tr>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {scene.outgoingLinks.map((link) => (
                  <tr key={link.id}>
                    <td className="px-4 py-3 font-medium text-[#1C2434]">{link.toScene.name}</td>
                    <td className="px-4 py-3 text-[#64748B]">{link.label || '-'}</td>
                    <td className="px-4 py-3 tabular-nums text-[#64748B]">
                      {link.yaw}° / {link.pitch}°
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[#64748B]">{link.sortOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button aria-label={`Edit link to ${link.toScene.name}`} className="h-11 w-11" iconOnly size="sm" title="Edit link" variant="ghost" onClick={() => openEdit(link)}><Pencil size={14} /></Button>
                        <Button aria-label={`Delete link to ${link.toScene.name}`} className="h-11 w-11" disabled={isSaving} iconOnly size="sm" title="Delete link" variant="ghost" onClick={() => onDelete(link)}><Trash2 className="text-[#DC2626]" size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
