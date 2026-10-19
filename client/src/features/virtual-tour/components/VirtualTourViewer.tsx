import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { VirtualTourPlugin, type VirtualTourNode } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';

import type { PublicVirtualTour } from '@/api/virtualTourApi';

type VirtualTourViewerProps = {
  activeSceneId: string;
  onSceneChange: (sceneId: string) => void;
  tour: PublicVirtualTour;
};

function angleToRadians(value: string) {
  const angle = Number.parseFloat(value);
  return value.trim().toLowerCase().endsWith('deg') ? (angle * Math.PI) / 180 : angle;
}

function initialPosition(node: VirtualTourNode) {
  const position = node.data?.initialPosition as { yaw?: string; pitch?: string } | undefined;

  if (!position?.yaw || !position.pitch) return undefined;

  return {
    yaw: angleToRadians(position.yaw),
    pitch: angleToRadians(position.pitch),
  };
}

export default function VirtualTourViewer({
  activeSceneId,
  onSceneChange,
  tour,
}: VirtualTourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<VirtualTourPlugin | null>(null);
  const onSceneChangeRef = useRef(onSceneChange);
  const [panoramaError, setPanoramaError] = useState(false);

  useEffect(() => {
    onSceneChangeRef.current = onSceneChange;
  }, [onSceneChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    setPanoramaError(false);
    let viewer: Viewer | null = null;

    // Deferring creation avoids a stale plugin initialization during React's
    // development-only Strict Mode mount/cleanup cycle.
    const initializationFrame = window.requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const nodes = tour.nodes as VirtualTourNode[];
      viewer = new Viewer({
        container: containerRef.current,
        defaultZoomLvl: 35,
        mousewheelCtrlKey: true,
        navbar: ['zoom', 'move', 'caption', 'fullscreen'],
        touchmoveTwoFingers: true,
        plugins: [
          MarkersPlugin,
          [
            VirtualTourPlugin,
            {
              nodes,
              positionMode: 'manual',
              preload: true,
              renderMode: '3d',
              startNodeId: tour.startNodeId,
              transitionOptions: (node: VirtualTourNode) => ({
                effect: 'fade',
                rotateTo: initialPosition(node),
                rotation: true,
                showLoader: true,
                speed: '20rpm',
              }),
            },
          ],
        ],
      });

      const plugin = viewer.getPlugin<VirtualTourPlugin>(VirtualTourPlugin);
      pluginRef.current = plugin;

      plugin.addEventListener('node-changed', ({ node }) => {
        onSceneChangeRef.current(node.id);
      });
      viewer.addEventListener('panorama-load', () => setPanoramaError(false));
      viewer.addEventListener('panorama-error', () => setPanoramaError(true));
    });

    return () => {
      window.cancelAnimationFrame(initializationFrame);
      pluginRef.current = null;
      viewer?.destroy();
    };
  }, [tour]);

  useEffect(() => {
    const plugin = pluginRef.current;
    const currentNode = plugin?.getCurrentNode();
    if (!plugin || !currentNode || currentNode.id === activeSceneId) return;

    const node = tour.nodes.find((item) => item.id === activeSceneId);
    void plugin
      .setCurrentNode(activeSceneId, {
        rotateTo: node ? initialPosition(node as VirtualTourNode) : undefined,
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPanoramaError(true);
      });
  }, [activeSceneId, tour.nodes]);

  return (
    <div className="relative h-full w-full bg-[#1a1212]">
      <div
        ref={containerRef}
        role="region"
        className="h-full w-full"
        aria-label={`${tour.title} interactive virtual tour`}
      />

      {panoramaError ? (
        <div
          role="alert"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1a1212] px-6 text-center text-white"
        >
          <ImageOff className="mb-4 text-[var(--gold-light)]" size={34} aria-hidden="true" />
          <p className="m-0 text-lg font-[var(--f-head)] font-bold">Panorama unavailable</p>
          <p className="mb-0 mt-2 max-w-md text-sm text-white/70">
            This scene image could not be loaded. Choose another scene or refresh the page.
          </p>
        </div>
      ) : null}
    </div>
  );
}
