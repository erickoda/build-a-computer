import { observeTheme, readIsDark } from '@/src/utils/theme';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { disposeScene } from '../utils/three';

// ─── useThreeScene ────────────────────────────────────────────────────────────
// Runs a procedural three.js scene on a <canvas> sized to its parent element.
// This is the WebGL counterpart of CanvasLayerDriver: three's renderer can't
// share the driver's 2D context, but every landing-page scene needs the same
// bookkeeping, so it lives here once and each scene only builds its model
// and says how it moves:
//   - WebGL renderer (the area stays empty when WebGL is unavailable)
//   - orthographic camera, refit by the scene on every resize
//   - pointer parallax, eased toward the pointer each frame
//   - rAF loop, paused while the tab is hidden
//   - one static pose instead of the loop for prefers-reduced-motion
//   - live light/dark theme, read from the `dark` class on <html> the same
//     way the driver does (see src/utils/theme.ts)
//   - disposal of every geometry, material and texture on unmount
//
// `setup` runs once per mount, so define it at module scope.

export type SceneContext = {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
};

export type Tilt = { x: number; y: number };

export type SceneController = {
  // Frame the model at rest for a viewport of this size.
  fit: (width: number, height: number) => void;
  // Advance the animation; `t` and `dt` are in seconds, `tilt` is the eased
  // pointer position in [-1, 1].
  update: (t: number, dt: number, tilt: Tilt) => void;
  // The still frame shown when the user prefers reduced motion.
  pose: () => void;
  setTheme: (isDark: boolean) => void;
};

export function useThreeScene(
  setup: (context: SceneContext) => SceneController,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch {
      // No WebGL (old device, disabled GPU) — leave the area empty.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    const controller = setup({ scene, camera });
    controller.setTheme(readIsDark());

    function renderStatic() {
      controller.pose();
      renderer.render(scene, camera);
    }

    function resize() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      controller.fit(width, height);
      if (reduceMotion) renderStatic();
    }

    const stopObservingTheme = observeTheme((isDark) => {
      controller.setTheme(isDark);
      // No running loop to pick the change up on the next frame.
      if (reduceMotion) renderStatic();
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const pointer = { x: 0, y: 0 };
    const tilt: Tilt = { x: 0, y: 0 };
    function handlePointer(event: PointerEvent) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    }

    let start = 0;
    let last = 0;
    let rafId = 0;

    function loop(now: number) {
      if (!start) start = now;
      const t = (now - start) / 1000;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      tilt.x += (pointer.x - tilt.x) * 0.04;
      tilt.y += (pointer.y - tilt.y) * 0.04;
      controller.update(t, dt, tilt);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    }

    function handleVisibility() {
      cancelAnimationFrame(rafId);
      if (!document.hidden) {
        last = 0;
        rafId = requestAnimationFrame(loop);
      }
    }

    if (!reduceMotion) {
      rafId = requestAnimationFrame(loop);
      window.addEventListener('pointermove', handlePointer);
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      stopObservingTheme();
      window.removeEventListener('pointermove', handlePointer);
      document.removeEventListener('visibilitychange', handleVisibility);
      disposeScene(scene);
      renderer.dispose();
    };
  }, [setup]);

  return canvasRef;
}
