import { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';

export default function TourTest() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewer = new Viewer({
      container: ref.current!,
      plugins: [
        MarkersPlugin,
        [
          VirtualTourPlugin,
          {
            positionMode: 'manual',
            renderMode: '3d',
            startNodeId: 'lobby',
            nodes: [
              {
                id: 'lobby',
                name: 'Lobby',
                panorama: '/tours/PANO_20201015_153714.jpg',
                links: [{ nodeId: 'corridor', position: { yaw: '90deg', pitch: '0deg' } }],
              },
              {
                id: 'corridor',
                name: 'Koridor',
                panorama: '/tours/PANO_20201020_074204.jpg',
                links: [{ nodeId: 'lobby', position: { yaw: '-90deg', pitch: '0deg' } }],
              },
            ],
          },
        ],
      ],
    });

    // helper: klik di panorama, lihat koordinat di console
    viewer.addEventListener('click', ({ data }) => {
      console.log(
        `yaw: ${((data.yaw * 180) / Math.PI).toFixed(1)}deg, pitch: ${((data.pitch * 180) / Math.PI).toFixed(1)}deg`,
      );
    });

    return () => viewer.destroy();
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100vh' }} />;
}
