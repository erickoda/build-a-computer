'use client';

import * as THREE from 'three';
import {
  SceneContext,
  SceneController,
  useThreeScene,
} from '../hooks/useThreeScene';
import {
  applyGlowTheme,
  box,
  easeOutCubic,
  fitOrthoCamera,
  GlowTheme,
  ISO_VIEW,
  makeGlowMaterial,
  makeGlowTexture,
  mulberry32,
  SCENE_MARGIN,
} from '../utils/three';

// ─── Benchmark chart scene ────────────────────────────────────────────────────
// An isometric 3D bar chart in warm amber — the "data" counterpart to the
// blue exploded PC in pc-model-scene.tsx, sharing its camera angle, lighting
// style and motion. Columns stand for games, rows for hardware tiers (the
// strongest tier at the back so the tall bars never hide the short ones).
//
// On mount the bars grow out of the platform in a diagonal wave. After that
// a light sheet sweeps across the chart like a benchmark run; each column it
// passes "re-runs" and its bars ease to fresh results with a flash on their
// glowing caps. The whole chart sways and follows the pointer a little.
//
// Renderer, loop, resize, pointer and theme handling live in useThreeScene;
// this file only builds the chart and animates it.

const COLORS = {
  base: 0x1c1410,
  wall: 0xf59e0b,
  glow: 0xfbbf24,
  line: 0xfbbf24,
  // One shade per hardware tier, back (strongest) to front.
  tiers: [0xfcd34d, 0xfbbf24, 0xf59e0b, 0xd97706],
};

const COLS = 6;
const ROWS = 4;
const SPACING = 0.6;
const BAR = 0.36;
const GRID_W = COLS * SPACING;
const GRID_D = ROWS * SPACING;
const MAX_H = 2.6;
const WALL_H = 3;
// Relative performance of each tier, back to front.
const TIER_FACTOR = [1, 0.8, 0.62, 0.45];

const FLOOR_GLOW: GlowTheme = {
  dark: { color: 0xd97706, opacity: 0.4 },
  light: { color: 0xb45309, opacity: 0.18 },
};

// Opacity here is the sweep's peak; the loop fades it in and out.
const BEAM: GlowTheme = {
  dark: { color: COLORS.glow, opacity: 0.9 },
  light: { color: 0xd97706, opacity: 0.45 },
};

type Bar = {
  mesh: THREE.Mesh;
  cap: THREE.Mesh;
  capMaterial: THREE.MeshStandardMaterial;
  row: number;
  col: number;
  current: number;
  target: number;
  flash: number;
};

// Vertical sheet of light: bright core fading out sideways and toward the top.
function makeBeamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const across = ctx.createLinearGradient(0, 0, 64, 0);
  across.addColorStop(0, 'rgba(255,255,255,0)');
  across.addColorStop(0.5, 'rgba(255,255,255,1)');
  across.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, 64, 128);
  ctx.globalCompositeOperation = 'destination-in';
  const up = ctx.createLinearGradient(0, 0, 0, 128);
  up.addColorStop(0, 'rgba(255,255,255,0)');
  up.addColorStop(1, 'rgba(255,255,255,1)');
  ctx.fillStyle = up;
  ctx.fillRect(0, 0, 64, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function colX(col: number) {
  return (col - (COLS - 1) / 2) * SPACING;
}

function rowZ(row: number) {
  return (row - (ROWS - 1) / 2) * SPACING;
}

// Platform with a glowing trim and cell grid, plus the two far walls of the
// chart (the ones facing the camera) with horizontal gridlines.
function makeFrame() {
  const group = new THREE.Group();
  const base = new THREE.MeshStandardMaterial({
    color: COLORS.base,
    metalness: 0.6,
    roughness: 0.4,
  });
  const glow = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: COLORS.glow,
    emissiveIntensity: 1,
    toneMapped: false,
  });
  const wall = new THREE.MeshStandardMaterial({
    color: COLORS.wall,
    emissive: 0xb45309,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const line = new THREE.LineBasicMaterial({
    color: COLORS.line,
    transparent: true,
    opacity: 0.35,
    toneMapped: false,
  });

  const pw = GRID_W + 0.5;
  const pd = GRID_D + 0.5;
  group.add(box(pw, 0.14, pd, base, 0, -0.07, 0));
  // Glowing trim along the platform's top edges.
  for (const z of [-pd / 2, pd / 2])
    group.add(box(pw, 0.03, 0.03, glow, 0, 0, z));
  for (const x of [-pw / 2, pw / 2])
    group.add(box(0.03, 0.03, pd, glow, x, 0, 0));

  const points: number[] = [];
  const y = 0.005;
  for (let c = 0; c <= COLS; c++) {
    const x = -GRID_W / 2 + c * SPACING;
    points.push(x, y, -GRID_D / 2, x, y, GRID_D / 2);
  }
  for (let r = 0; r <= ROWS; r++) {
    const z = -GRID_D / 2 + r * SPACING;
    points.push(-GRID_W / 2, y, z, GRID_W / 2, y, z);
  }

  // Far walls: back (-z) and right (+x).
  const backZ = -pd / 2;
  const rightX = pw / 2;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(pw, WALL_H), wall);
  back.position.set(0, WALL_H / 2, backZ);
  group.add(back);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(pd, WALL_H), wall);
  right.rotation.y = -Math.PI / 2;
  right.position.set(rightX, WALL_H / 2, 0);
  group.add(right);
  for (let h = 0.5; h <= WALL_H; h += 0.5) {
    points.push(-pw / 2, h, backZ, rightX, h, backZ);
    points.push(rightX, h, backZ, rightX, h, pd / 2);
  }
  // Wall edges: corner post and top rails.
  group.add(box(0.04, WALL_H, 0.04, glow, rightX, WALL_H / 2, backZ));
  group.add(box(pw, 0.03, 0.03, glow, 0, WALL_H, backZ));
  group.add(box(0.03, 0.03, pd, glow, rightX, WALL_H, 0));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(points, 3),
  );
  group.add(new THREE.LineSegments(geometry, line));
  return group;
}

function setupBenchmarkChart({ scene, camera }: SceneContext): SceneController {
  // Lights: warm sky/ground fill, a white key light from the camera side,
  // an amber rim, and a glow hovering over the chart.
  scene.add(new THREE.HemisphereLight(0xfde68a, 0x292524, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-4, 8, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf59e0b, 1.5);
  rim.position.set(5, 3, -4);
  scene.add(rim);
  const overhead = new THREE.PointLight(COLORS.glow, 5, 6, 1.5);
  overhead.position.set(0, 2.2, 0.5);
  scene.add(overhead);

  const model = new THREE.Group();
  scene.add(model);
  model.add(makeFrame());

  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    makeGlowMaterial(makeGlowTexture(false)),
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = -0.16;
  model.add(floorGlow);

  // Bars: one unit-tall geometry with its origin at the bottom, scaled in
  // y to the bar's value; the glowing cap rides on top.
  const random = mulberry32(7);
  const barGeometry = new THREE.BoxGeometry(BAR, 1, BAR).translate(0, 0.5, 0);
  const capGeometry = new THREE.BoxGeometry(BAR + 0.01, 0.03, BAR + 0.01);
  const tierMaterials = COLORS.tiers.map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.25,
        metalness: 0.35,
        roughness: 0.4,
      }),
  );
  const gameFactor = Array.from({ length: COLS }, () => 0.55 + random() * 0.45);
  const sample = (row: number, col: number) =>
    MAX_H * TIER_FACTOR[row] * gameFactor[col] * (0.88 + random() * 0.12);

  const bars: Bar[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const mesh = new THREE.Mesh(barGeometry, tierMaterials[row]);
      mesh.position.set(colX(col), 0, rowZ(row));
      const capMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: COLORS.glow,
        emissiveIntensity: 1,
        toneMapped: false,
      });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.set(colX(col), 0, rowZ(row));
      model.add(mesh, cap);
      bars.push({
        mesh,
        cap,
        capMaterial,
        row,
        col,
        current: 0,
        target: sample(row, col),
        flash: 0,
      });
    }
  }

  function setBar(bar: Bar, height: number) {
    const h = Math.max(height, 0.001);
    bar.mesh.scale.y = h;
    bar.cap.position.y = h + 0.015;
    bar.capMaterial.emissiveIntensity = 1 + bar.flash * 2.5;
  }

  // Light sheet that sweeps across the columns (along x).
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, WALL_H),
    makeGlowMaterial(makeBeamTexture()),
  );
  beam.material.side = THREE.DoubleSide;
  // Faces the camera side-on enough to read as a sheet, spanning the rows.
  beam.scale.x = (GRID_D + 0.4) / 0.5;
  beam.rotation.y = Math.PI / 2;
  beam.position.y = WALL_H / 2;
  beam.visible = false;
  model.add(beam);
  // Where the sheet meets the platform: a bright line across the rows.
  const beamFloor = box(
    0.04,
    0.02,
    GRID_D + 0.4,
    new THREE.MeshBasicMaterial({ color: COLORS.glow, toneMapped: false }),
    0,
    0.01,
    0,
  );
  beamFloor.visible = false;
  model.add(beamFloor);
  const beamStart = -GRID_W / 2 - 0.2;
  const beamEnd = GRID_W / 2 + 0.2;
  const sweepDuration = 3.2;
  const sweepPeriod = 5;
  let beamPeak = BEAM.dark.opacity;
  let lastBeamX = beamStart;

  const introDelay = 0.35;
  const growDuration = 1.4;
  // Diagonal wave: front-left bars first, back-right last.
  const stagger = 0.08;
  const introEnd = introDelay + growDuration + stagger * (COLS + ROWS - 2);

  function sweep(t: number, dt: number) {
    // Benchmark sweep: re-roll each column as the beam crosses it.
    const phase = ((t - introEnd) % sweepPeriod) / sweepDuration;
    const sweeping = phase <= 1;
    const beamX = THREE.MathUtils.lerp(beamStart, beamEnd, Math.min(phase, 1));
    beam.visible = sweeping;
    beamFloor.visible = sweeping;
    beam.material.opacity = sweeping ? beamPeak * Math.sin(Math.PI * phase) : 0;
    beam.position.x = beamX;
    beamFloor.position.x = beamX;
    if (sweeping && beamX > lastBeamX) {
      for (let col = 0; col < COLS; col++) {
        const x = colX(col);
        if (lastBeamX < x && x <= beamX) {
          gameFactor[col] = 0.55 + random() * 0.45;
          for (const bar of bars) {
            if (bar.col !== col) continue;
            bar.target = sample(bar.row, col);
            bar.flash = 1;
          }
        }
      }
    }
    lastBeamX = sweeping ? beamX : beamStart;

    const ease = 1 - Math.exp(-dt * 4);
    for (const bar of bars) {
      bar.current += (bar.target - bar.current) * ease;
      bar.flash = Math.max(bar.flash - dt * 1.5, 0);
      setBar(bar, bar.current);
    }
  }

  return {
    // The walls are taller than any bar, so the bounds don't depend on the
    // bar heights and the fit holds for the whole animation.
    fit(width, height) {
      model.rotation.set(0, 0, 0);
      model.position.set(0, 0, 0);
      // The floor glow is a large soft plane; keep it out of the bounds.
      model.remove(floorGlow);
      fitOrthoCamera(camera, model, ISO_VIEW, width, height, SCENE_MARGIN);
      model.add(floorGlow);
    },

    update(t, dt, tilt) {
      if (t < introEnd) {
        for (const bar of bars) {
          const delay = introDelay + stagger * (bar.col + (ROWS - 1 - bar.row));
          const grow = THREE.MathUtils.clamp((t - delay) / growDuration, 0, 1);
          bar.current = bar.target * easeOutCubic(grow);
          setBar(bar, bar.current);
        }
      } else {
        sweep(t, dt);
      }

      model.rotation.y = Math.sin(t * 0.25) * 0.08 + tilt.x * 0.1;
      model.rotation.x = tilt.y * 0.04;
      model.position.y = Math.sin(t * 0.9) * 0.05;
    },

    pose() {
      model.rotation.set(0, 0, 0);
      model.position.set(0, 0, 0);
      for (const bar of bars) setBar(bar, bar.target);
    },

    setTheme(isDark) {
      applyGlowTheme(floorGlow.material, FLOOR_GLOW, isDark);
      applyGlowTheme(beam.material, BEAM, isDark);
      beamPeak = (isDark ? BEAM.dark : BEAM.light).opacity;
    },
  };
}

export function BenchmarkChartScene({ className }: { className?: string }) {
  const canvasRef = useThreeScene(setupBenchmarkChart);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? 'pointer-events-none block h-full w-full'}
    />
  );
}
