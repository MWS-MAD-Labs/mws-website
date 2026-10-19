import type { VirtualTourLink, VirtualTourScene } from '@/admin/api/adminApi';

export type SceneForm = {
  tourId: string;
  panoramaImageId: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  setAsMain: boolean;
};

export type HotspotRow = {
  id: string;
  persisted: boolean;
  toSceneId: string;
  label: string;
  yaw: number;
  pitch: number;
  sortOrder: number;
};

export type HotspotForm = {
  id: string | null;
  toSceneId: string;
  label: string;
  yaw: number;
  pitch: number;
};

export function hotspotRowFromLink(link: VirtualTourLink): HotspotRow {
  return {
    id: link.id,
    persisted: true,
    toSceneId: link.toSceneId,
    label: link.label ?? '',
    yaw: link.yaw,
    pitch: link.pitch,
    sortOrder: link.sortOrder,
  };
}

export function roundedCoordinate(value: number) {
  return Math.round(value * 10) / 10;
}

export function createHotspotForm(row: HotspotRow): HotspotForm {
  return {
    id: row.id,
    toSceneId: row.toSceneId,
    label: row.label,
    yaw: row.yaw,
    pitch: row.pitch,
  };
}

export function sceneFormFromScene(
  tourId: string,
  scene: VirtualTourScene | null,
  isMainScene: boolean,
): SceneForm {
  return {
    tourId,
    panoramaImageId: scene?.panoramaImageId ?? '',
    name: scene?.name ?? '',
    slug: scene?.slug ?? '',
    description: scene?.description ?? '',
    isActive: scene?.isActive ?? true,
    setAsMain: isMainScene,
  };
}
