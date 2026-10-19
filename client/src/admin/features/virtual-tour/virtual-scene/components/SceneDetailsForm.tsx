import type {
  VirtualTourDetail,
  VirtualTourListItem,
  VirtualTourScene,
} from '@/admin/api/adminApi';
import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';
import { FIELD_CLASS, toVirtualTourSlug } from '../../virtualTourUtils';
import type { SceneForm } from '../sceneEditorModel';

type SceneDetailsFormProps = {
  form: SceneForm;
  isSaving: boolean;
  scene: VirtualTourScene | null;
  tour: VirtualTourDetail;
  tours: VirtualTourListItem[];
  onTourChange: (tourId: string) => void;
  onUpdate: (changes: Partial<SceneForm>) => void;
};

export default function SceneDetailsForm({
  form,
  isSaving,
  scene,
  tour,
  tours,
  onTourChange,
  onUpdate,
}: SceneDetailsFormProps) {
  const isCurrentMainScene = tour.startSceneId === scene?.id;

  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Virtual tour" required>
          <Select
            disabled={Boolean(scene) || isSaving}
            required
            value={form.tourId}
            onChange={(event) => onTourChange(event.target.value)}
          >
            {tours.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Scene name" required>
          <input
            className={FIELD_CLASS}
            disabled={isSaving}
            maxLength={255}
            required
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;

              onUpdate({
                name,
                slug: scene ? form.slug : toVirtualTourSlug(name),
              });
            }}
          />
        </Field>

        <Field label="Status" optional={false}>
          <Select
            disabled={isSaving}
            value={form.isActive ? 'active' : 'inactive'}
            onChange={(event) => onUpdate({ isActive: event.target.value === 'active' })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
      </div>

      <div className="mt-5 border-t border-[#E2E8F0] pt-4">
        <label className="flex items-center gap-2 text-sm font-medium text-[#1C2434]">
          <input
            checked={form.setAsMain}
            disabled={isSaving || isCurrentMainScene || tour.scenes.length === 0}
            type="checkbox"
            onChange={(event) =>
              onUpdate({
                setAsMain: event.target.checked,
                ...(event.target.checked ? { isActive: true } : {}),
              })
            }
          />

          <span>
            Set as Main Scene
            {isCurrentMainScene && (
              <span className="ml-1 text-xs font-normal text-[#64748B]">(current Main Scene)</span>
            )}
          </span>
        </label>
      </div>
    </section>
  );
}
