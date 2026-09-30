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

// ─── PC model scene ───────────────────────────────────────────────────────────
// An isometric, "exploded" gaming PC built procedurally with three.js: a
// glass-sided case with glowing fans, and the motherboard, CPU cooler and
// GPU pulled out of it, plus a pair of hard drives. No external model files — every part is
// a handful of primitive geometries, so there is nothing to fetch and the
// whole scene is a few hundred triangles per part.
//
// Every movable part has an assembled position (inside the case) and an
// explode offset. On mount the parts fly out from the assembled state, then
// the explode factor "breathes" gently while the whole model sways and
// follows the pointer a little.
//
// Renderer, loop, resize, pointer and theme handling live in useThreeScene;
// this file only builds the model and animates it.

const COLORS = {
  frame: 0x0b1020,
  panel: 0x1d4ed8,
  panelInner: 0x1e3a8a,
  glass: 0x38bdf8,
  glow: 0x22d3ee,
  blade: 0x0ea5e9,
  pcb: 0x0b1220,
  darkPart: 0x1f2937,
  metal: 0x9ca3af,
  shroud: 0xd1d5db,
};

const FAN_HALO: GlowTheme = {
  dark: { color: COLORS.glow, opacity: 0.55 },
  light: { color: 0x0284c7, opacity: 0.35 },
};

const FLOOR_GLOW: GlowTheme = {
  dark: { color: 0x2563eb, opacity: 0.45 },
  light: { color: 0x1d4ed8, opacity: 0.18 },
};

// Case dimensions (x = width, y = height, z = depth).
const W = 2;
const H = 3;
const D = 2.8;

type Part = {
  object: THREE.Object3D;
  base: THREE.Vector3;
  offset: THREE.Vector3;
};

type Materials = ReturnType<typeof makeMaterials>;

function makeMaterials(ringTexture: THREE.Texture) {
  return {
    // One halo shared by every fan so a theme change touches one material.
    halo: makeGlowMaterial(ringTexture),
    frame: new THREE.MeshStandardMaterial({
      color: COLORS.frame,
      metalness: 0.6,
      roughness: 0.35,
    }),
    panel: new THREE.MeshStandardMaterial({
      color: COLORS.panel,
      metalness: 0.4,
      roughness: 0.45,
    }),
    panelInner: new THREE.MeshStandardMaterial({
      color: COLORS.panelInner,
      emissive: 0x0369a1,
      emissiveIntensity: 0.55,
      metalness: 0.2,
      roughness: 0.7,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: COLORS.glass,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.22,
      metalness: 0.1,
      roughness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    glow: new THREE.MeshStandardMaterial({
      color: COLORS.glow,
      emissive: COLORS.glow,
      emissiveIntensity: 2.2,
      toneMapped: false,
    }),
    blade: new THREE.MeshStandardMaterial({
      color: COLORS.blade,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.3,
      side: THREE.DoubleSide,
    }),
    pcb: new THREE.MeshStandardMaterial({
      color: COLORS.pcb,
      metalness: 0.3,
      roughness: 0.6,
    }),
    darkPart: new THREE.MeshStandardMaterial({
      color: COLORS.darkPart,
      metalness: 0.7,
      roughness: 0.35,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: COLORS.metal,
      metalness: 0.85,
      roughness: 0.3,
    }),
    shroud: new THREE.MeshStandardMaterial({
      color: COLORS.shroud,
      metalness: 0.6,
      roughness: 0.35,
    }),
    label: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.1,
      roughness: 0.6,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.3,
    }),
    trace: new THREE.LineBasicMaterial({
      color: COLORS.glow,
      transparent: true,
      opacity: 0.75,
      toneMapped: false,
    }),
  };
}

// A case fan facing +z: square frame, glowing ring, and a spinning rotor.
function makeFan(size: number, mats: Materials, rotors: THREE.Object3D[]) {
  const fan = new THREE.Group();
  const depth = size * 0.12;
  const half = size / 2;

  const frameShape = new THREE.Shape();
  frameShape.moveTo(-half, -half);
  frameShape.lineTo(half, -half);
  frameShape.lineTo(half, half);
  frameShape.lineTo(-half, half);
  frameShape.lineTo(-half, -half);
  const hole = new THREE.Path();
  hole.absarc(0, 0, size * 0.44, 0, Math.PI * 2, true);
  frameShape.holes.push(hole);
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const screwHole = new THREE.Path();
      screwHole.absarc(
        sx * size * 0.42,
        sy * size * 0.42,
        size * 0.035,
        0,
        Math.PI * 2,
        true,
      );
      frameShape.holes.push(screwHole);
    }
  }
  const frameGeometry = new THREE.ExtrudeGeometry(frameShape, {
    depth,
    bevelEnabled: false,
    curveSegments: 32,
  });
  frameGeometry.translate(0, 0, -depth / 2);
  fan.add(new THREE.Mesh(frameGeometry, mats.frame));

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(size * 0.445, size * 0.03, 10, 48),
    mats.glow,
  );
  ring.position.z = depth / 2;
  fan.add(ring);

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(size * 1.35, size * 1.35),
    mats.halo,
  );
  halo.position.z = depth / 2 + 0.01;
  fan.add(halo);

  // Motor struts behind the blades.
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const strut = box(
      size * 0.34,
      size * 0.03,
      depth * 0.3,
      mats.frame,
      Math.cos(angle) * size * 0.27,
      Math.sin(angle) * size * 0.27,
      -depth * 0.35,
    );
    strut.rotation.z = angle;
    fan.add(strut);
  }

  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.13, size * 0.13, depth * 0.8, 24),
    mats.frame,
  );
  hub.rotation.x = Math.PI / 2;
  rotor.add(hub);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.1, size * 0.1, 0.01, 24),
    mats.shroud,
  );
  cap.rotation.x = Math.PI / 2;
  cap.position.z = depth * 0.4 + 0.005;
  rotor.add(cap);
  const capDot = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.03, size * 0.03, 0.012, 12),
    mats.glow,
  );
  capDot.rotation.x = Math.PI / 2;
  capDot.position.z = depth * 0.4 + 0.008;
  rotor.add(capDot);

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, -0.05);
  bladeShape.quadraticCurveTo(0.2, -0.11, 0.3, -0.02);
  bladeShape.lineTo(0.29, 0.1);
  bladeShape.quadraticCurveTo(0.16, 0.05, 0, 0.06);
  const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.012,
    bevelEnabled: false,
    curveSegments: 8,
  });
  bladeGeometry.scale(size, size, size);
  const bladeCount = 7;
  for (let i = 0; i < bladeCount; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / bladeCount) * Math.PI * 2;
    const blade = new THREE.Mesh(bladeGeometry, mats.blade);
    blade.position.x = size * 0.11;
    blade.rotation.x = 0.35;
    pivot.add(blade);
    rotor.add(pivot);
  }
  fan.add(rotor);
  rotors.push(rotor);

  return fan;
}

function makeCase(mats: Materials, rotors: THREE.Object3D[], parts: Part[]) {
  const group = new THREE.Group();
  const t = 0.12;

  // Frame edges.
  for (const y of [-H / 2, H / 2]) {
    for (const z of [-D / 2, D / 2]) {
      group.add(box(W + t, t, t, mats.frame, 0, y, z));
    }
  }
  for (const x of [-W / 2, W / 2]) {
    for (const z of [-D / 2, D / 2]) {
      group.add(box(t, H, t, mats.frame, x, 0, z));
    }
    for (const y of [-H / 2, H / 2]) {
      group.add(box(t, t, D + t, mats.frame, x, y, 0));
    }
  }

  // Glass side panel (faces the camera) and glass top.
  const glassSide = new THREE.Mesh(new THREE.PlaneGeometry(D, H), mats.glass);
  glassSide.rotation.y = -Math.PI / 2;
  glassSide.position.x = -W / 2 - 0.02;
  group.add(glassSide);
  for (const y of [-H / 2 + 0.15, H / 2 - 0.15]) {
    for (const z of [-D / 2 + 0.15, D / 2 - 0.15]) {
      const screw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16),
        mats.frame,
      );
      screw.rotation.z = Math.PI / 2;
      screw.position.set(-W / 2 - 0.04, y, z);
      group.add(screw);
    }
  }
  const glassTop = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mats.glass);
  glassTop.rotation.x = -Math.PI / 2;
  glassTop.position.y = H / 2 + 0.02;
  group.add(glassTop);

  // Solid walls: a lit interior visible through the glass, and a blue front.
  group.add(box(0.04, H, D, mats.panelInner, W / 2 - 0.02, 0, 0));
  group.add(box(W, H, 0.04, mats.panelInner, 0, 0, -D / 2 + 0.02));
  group.add(box(W, 0.04, D, mats.panelInner, 0, -H / 2 + 0.02, 0));
  group.add(box(W, H, 0.05, mats.panel, 0, 0, D / 2));

  // Ventilation grille on the back wall.
  for (let i = 0; i < 7; i++) {
    group.add(
      box(0.9, 0.035, 0.02, mats.frame, 0.2, 0.9 - i * 0.11, -D / 2 + 0.05),
    );
  }

  // Expansion slot covers on the back wall, under the grille.
  for (let i = 0; i < 5; i++) {
    group.add(
      box(0.75, 0.05, 0.02, mats.metal, 0.3, -0.35 - i * 0.1, -D / 2 + 0.05),
    );
  }

  // Motherboard tray: perforated grid and cable grommets near the front.
  const dotStep = 0.12;
  const dotRows = 16;
  const dotCols = 17;
  const dots = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.01, 0.04, 0.04),
    mats.frame,
    dotRows * dotCols,
  );
  const dotMatrix = new THREE.Matrix4();
  for (let r = 0; r < dotRows; r++) {
    for (let c = 0; c < dotCols; c++) {
      dotMatrix.makeTranslation(
        W / 2 - 0.045,
        -0.6 + r * dotStep,
        -D / 2 + 0.2 + c * dotStep,
      );
      dots.setMatrixAt(r * dotCols + c, dotMatrix);
    }
  }
  group.add(dots);
  for (const y of [0.9, 0.25, -0.4]) {
    group.add(box(0.02, 0.4, 0.12, mats.frame, W / 2 - 0.05, y, D / 2 - 0.2));
  }

  // PSU shroud with side vents and an LED strip along its top edge.
  group.add(box(W - 0.1, 0.5, D - 0.1, mats.panel, 0, -H / 2 + 0.3, 0));
  for (let i = 0; i < 4; i++) {
    group.add(
      box(
        0.02,
        0.035,
        0.6,
        mats.frame,
        -W / 2 + 0.04,
        -H / 2 + 0.42 - i * 0.08,
        D / 2 - 0.55,
      ),
    );
  }
  group.add(
    box(0.02, 0.02, D - 0.1, mats.glow, -W / 2 + 0.045, -H / 2 + 0.55, 0),
  );

  // Power button on the top front edge.
  const button = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.03, 20),
    mats.frame,
  );
  button.position.set(-W / 2 + 0.35, H / 2 + 0.07, D / 2);
  group.add(button);
  const buttonRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.05, 0.01, 6, 20),
    mats.glow,
  );
  buttonRing.rotation.x = Math.PI / 2;
  buttonRing.position.set(-W / 2 + 0.35, H / 2 + 0.085, D / 2);
  group.add(buttonRing);

  // Feet.
  for (const x of [-W / 2 + 0.2, W / 2 - 0.2]) {
    for (const z of [-D / 2 + 0.25, D / 2 - 0.25]) {
      group.add(box(0.25, 0.1, 0.25, mats.frame, x, -H / 2 - 0.1, z));
    }
  }

  // Fans: two on the front, two on top.
  const fanSize = 1.25;
  for (const y of [0.7, -0.62]) {
    const fan = makeFan(fanSize, mats, rotors);
    parts.push({
      object: fan,
      base: new THREE.Vector3(0, y, D / 2 + 0.1),
      offset: new THREE.Vector3(0, 0, 0.45),
    });
  }
  for (const z of [-0.65, 0.65]) {
    const fan = makeFan(fanSize, mats, rotors);
    fan.rotation.x = -Math.PI / 2;
    parts.push({
      object: fan,
      base: new THREE.Vector3(0, H / 2 + 0.1, z),
      offset: new THREE.Vector3(0, 0.45, 0),
    });
  }

  return group;
}

// Motherboard lying in the YZ plane, components facing -x.
function makeMotherboard(mats: Materials) {
  const group = new THREE.Group();
  const boardH = 2.4;
  const boardD = 2.1;
  group.add(box(0.06, boardH, boardD, mats.pcb));

  // Circuit traces: short Manhattan paths on the board surface.
  const random = mulberry32(7);
  const points: number[] = [];
  const surface = -0.035;
  for (let i = 0; i < 46; i++) {
    let y = (random() - 0.5) * (boardH - 0.2);
    let z = (random() - 0.5) * (boardD - 0.2);
    const segments = 2 + Math.floor(random() * 3);
    for (let s = 0; s < segments; s++) {
      const length = 0.1 + random() * 0.45;
      let ny = y;
      let nz = z;
      if (s % 2 === 0) ny += random() < 0.5 ? -length : length;
      else nz += random() < 0.5 ? -length : length;
      ny = THREE.MathUtils.clamp(ny, -boardH / 2 + 0.05, boardH / 2 - 0.05);
      nz = THREE.MathUtils.clamp(nz, -boardD / 2 + 0.05, boardD / 2 - 0.05);
      points.push(surface, y, z, surface, ny, nz);
      y = ny;
      z = nz;
    }
  }
  const traceGeometry = new THREE.BufferGeometry();
  traceGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(points, 3),
  );
  group.add(new THREE.LineSegments(traceGeometry, mats.trace));

  // I/O cover and VRM heatsinks.
  group.add(box(0.28, 1.0, 0.24, mats.darkPart, -0.14, 0.55, -0.9));
  group.add(box(0.02, 0.9, 0.02, mats.glow, -0.29, 0.55, -0.79));
  group.add(box(0.22, 0.25, 0.85, mats.darkPart, -0.11, 1.0, -0.3));

  // CPU socket.
  group.add(box(0.06, 0.45, 0.45, mats.metal, -0.05, 0.45, -0.25));

  // RAM sticks with glowing top strips.
  for (let i = 0; i < 4; i++) {
    const z = 0.45 + i * 0.11;
    group.add(box(0.28, 1.05, 0.045, mats.darkPart, -0.14, 0.4, z));
    group.add(box(0.03, 0.95, 0.05, mats.glow, -0.29, 0.4, z));
  }

  // PCIe slots, chipset heatsink, M.2 cover.
  for (const y of [-0.35, -0.75]) {
    group.add(box(0.06, 0.07, 1.3, mats.frame, -0.05, y, -0.3));
  }
  group.add(box(0.06, 0.35, 0.35, mats.metal, -0.05, -0.95, 0.6));
  group.add(box(0.04, 0.12, 0.6, mats.darkPart, -0.04, -1.05, -0.35));

  // Capacitors around the CPU socket.
  const capGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.1, 12);
  const capPositions: [number, number][] = [];
  for (let i = 0; i < 7; i++) capPositions.push([0.8, -0.6 + i * 0.1]);
  for (let i = 0; i < 4; i++) capPositions.push([0.28 + i * 0.1, -0.6]);
  for (const [y, z] of capPositions) {
    const cap = new THREE.Mesh(capGeometry, mats.metal);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(-0.08, y, z);
    group.add(cap);
  }

  // 24-pin power connector and SATA ports along the front edge.
  group.add(box(0.12, 0.55, 0.1, mats.darkPart, -0.06, 0.4, 0.95));
  group.add(box(0.02, 0.5, 0.06, mats.frame, -0.125, 0.4, 0.95));
  for (let i = 0; i < 4; i++) {
    group.add(
      box(0.1, 0.06, 0.12, mats.darkPart, -0.05, -0.35 - i * 0.1, 0.97),
    );
  }

  // RAM slot latches.
  for (let i = 0; i < 4; i++) {
    const z = 0.45 + i * 0.11;
    for (const y of [0.95, -0.15]) {
      group.add(box(0.1, 0.05, 0.06, mats.shroud, -0.05, y, z));
    }
  }

  // PCIe slot latches, CMOS battery, small controller chips.
  for (const y of [-0.35, -0.75]) {
    group.add(box(0.08, 0.1, 0.06, mats.shroud, -0.06, y, 0.38));
  }
  const battery = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24),
    mats.metal,
  );
  battery.rotation.z = Math.PI / 2;
  battery.position.set(-0.045, -0.55, 0.62);
  group.add(battery);
  for (const [y, z, s] of [
    [0.0, 0.15, 0.18],
    [-0.1, -0.75, 0.14],
    [-0.55, 0.2, 0.12],
    [-0.55, -0.55, 0.1],
  ]) {
    group.add(box(0.03, s, s, mats.darkPart, -0.045, y, z));
  }

  // Front-panel headers along the bottom edge.
  for (let i = 0; i < 5; i++) {
    group.add(box(0.06, 0.05, 0.16, mats.frame, -0.06, -1.15, -0.85 + i * 0.3));
  }

  // Gold-ringed mounting holes.
  const ringGeometry = new THREE.TorusGeometry(0.045, 0.012, 6, 16);
  for (const [y, z] of [
    [1.1, -0.95],
    [1.1, 0.95],
    [-0.2, -0.95],
    [-0.2, 0.95],
    [-1.1, 0.95],
  ]) {
    const ring = new THREE.Mesh(ringGeometry, mats.gold);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-0.035, y, z);
    group.add(ring);
  }

  return group;
}

// Two stacked 3.5" hard drives: dark base, brushed top, printed label.
function makeDrives(mats: Materials) {
  const group = new THREE.Group();
  const w = 1.0;
  const h = 0.16;
  const d = 0.72;
  for (let i = 0; i < 2; i++) {
    const drive = new THREE.Group();
    drive.position.y = i * (h + 0.04);
    drive.add(box(w, h * 0.55, d, mats.darkPart, 0, -h * 0.22, 0));
    drive.add(box(w, h * 0.45, d, mats.shroud, 0, h * 0.28, 0));
    drive.add(
      box(w * 0.6, 0.01, d * 0.72, mats.label, -w * 0.08, h / 2 + 0.005, 0),
    );
    drive.add(
      box(
        w * 0.6,
        0.012,
        d * 0.14,
        mats.panel,
        -w * 0.08,
        h / 2 + 0.007,
        -d * 0.22,
      ),
    );
    for (let l = 0; l < 3; l++) {
      drive.add(
        box(
          w * 0.32,
          0.012,
          0.025,
          mats.frame,
          -w * 0.2,
          h / 2 + 0.007,
          d * 0.02 + l * 0.07,
        ),
      );
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        drive.add(
          box(
            0.04,
            0.012,
            0.04,
            mats.metal,
            sx * (w / 2 - 0.06),
            h / 2 + 0.004,
            sz * (d / 2 - 0.06),
          ),
        );
      }
    }
    // SATA connectors on the back end.
    drive.add(box(0.02, 0.05, 0.25, mats.frame, w / 2 + 0.01, -h * 0.2, -0.15));
    group.add(drive);
  }
  return group;
}

// Tower cooler: fin stack sticking out along -x with a fan on its +z side.
function makeCooler(mats: Materials, rotors: THREE.Object3D[]) {
  const group = new THREE.Group();
  group.add(box(0.1, 0.4, 0.4, mats.metal, 0.05, 0, 0));
  const finCount = 15;
  for (let i = 0; i < finCount; i++) {
    group.add(box(0.025, 0.85, 0.75, mats.darkPart, -0.05 - i * 0.056, 0, 0));
  }
  group.add(box(0.86, 0.06, 0.78, mats.frame, -0.44, 0.44, 0));
  group.add(box(0.86, 0.02, 0.02, mats.glow, -0.44, 0.44, 0.395));
  for (const x of [-0.2, -0.68]) {
    for (const z of [-0.15, 0.15]) {
      const pipeEnd = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10),
        mats.metal,
      );
      pipeEnd.position.set(x, 0.49, z);
      group.add(pipeEnd);
    }
  }
  for (const z of [-0.2, 0, 0.2]) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.95, 10),
      mats.metal,
    );
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(-0.42, -0.25, z);
    group.add(pipe);
  }
  const fan = makeFan(0.82, mats, rotors);
  fan.position.set(-0.44, 0, 0.44);
  group.add(fan);
  return group;
}

// Triple-fan graphics card mounted parallel to the motherboard, fans facing
// -x: dark shroud with silver side rails, finned heatsink peeking out of the
// top, backplate, I/O bracket, power connectors and gold PCIe fingers.
function makeGpu(mats: Materials, rotors: THREE.Object3D[]) {
  const group = new THREE.Group();
  const length = 2.5;
  const height = 1.0;

  // Heatsink core with fins showing along the top edge.
  group.add(box(0.3, height - 0.1, length - 0.1, mats.darkPart, 0.02, 0, 0));
  for (let i = 0; i < 26; i++) {
    const z = -length / 2 + 0.15 + i * 0.085;
    group.add(box(0.26, 0.08, 0.02, mats.metal, 0.02, height / 2 - 0.02, z));
  }

  // Shroud facing the fans, with silver rails top and bottom.
  group.add(box(0.08, height, length, mats.frame, -0.15, 0, 0));
  for (const y of [height / 2 - 0.04, -height / 2 + 0.04]) {
    group.add(box(0.1, 0.08, length + 0.02, mats.shroud, -0.16, y, 0));
  }
  group.add(
    box(0.02, 0.025, length - 0.3, mats.glow, -0.215, height / 2 - 0.1, 0),
  );

  // Backplate.
  group.add(box(0.03, height, length, mats.shroud, 0.185, 0, 0));

  // I/O bracket at the rear, power connectors on top, PCIe fingers below.
  group.add(
    box(0.02, height + 0.25, 0.14, mats.metal, 0.12, 0.05, -length / 2 - 0.08),
  );
  for (const z of [0.55, 0.8]) {
    group.add(box(0.14, 0.1, 0.2, mats.frame, 0.08, height / 2 + 0.05, z));
  }
  group.add(box(0.03, 0.08, 1.1, mats.gold, 0.12, -height / 2 - 0.04, -0.35));

  for (const z of [-0.78, 0, 0.78]) {
    const fan = makeFan(0.74, mats, rotors);
    fan.rotation.y = -Math.PI / 2;
    fan.position.set(-0.24, 0, z);
    group.add(fan);
  }
  // Angled toward the camera so the fans read face-on rather than edge-on.
  group.rotation.y = 0.5;
  return group;
}

function setupPcModel({ scene, camera }: SceneContext): SceneController {
  // Lights: soft sky/ground fill, a cool key light from the camera side,
  // and a cyan light inside the case so the interior glows through glass.
  scene.add(new THREE.HemisphereLight(0x93c5fd, 0x1e1b4b, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 8, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x60a5fa, 1.5);
  rim.position.set(5, 3, -4);
  scene.add(rim);
  const inner = new THREE.PointLight(COLORS.glow, 6, 6, 1.5);
  inner.position.set(0, 0.3, 0);
  scene.add(inner);

  const mats = makeMaterials(makeGlowTexture(true));
  const rotors: THREE.Object3D[] = [];
  const parts: Part[] = [];

  const model = new THREE.Group();
  scene.add(model);
  model.add(makeCase(mats, rotors, parts));

  // Floor glow under the case.
  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    makeGlowMaterial(makeGlowTexture(false)),
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.set(-0.8, -H / 2 - 0.16, 0.4);
  model.add(floorGlow);

  // Movable parts. Assembled = inside the case; offsets pull them out.
  const moboBase = new THREE.Vector3(W / 2 - 0.15, 0.3, -0.15);
  const moboOffset = new THREE.Vector3(-3.3, 0.1, 0);
  parts.push({
    object: makeMotherboard(mats),
    base: moboBase,
    offset: moboOffset,
  });
  parts.push({
    object: makeCooler(mats, rotors),
    base: moboBase.clone().add(new THREE.Vector3(-0.1, 0.45, -0.25)),
    offset: moboOffset.clone().add(new THREE.Vector3(-0.65, 0.15, 0)),
  });
  parts.push({
    object: makeGpu(mats, rotors),
    base: moboBase.clone().add(new THREE.Vector3(-0.25, -0.6, -0.1)),
    offset: moboOffset.clone().add(new THREE.Vector3(-1.0, -0.6, 0.35)),
  });
  const drivesBase = new THREE.Vector3(0.3, -H / 2 + 0.2, 0.6);
  parts.push({
    object: makeDrives(mats),
    base: drivesBase,
    offset: new THREE.Vector3(-0.5, -H / 2 - 0.05, D / 2 + 0.95).sub(
      drivesBase,
    ),
  });
  for (const part of parts) model.add(part.object);

  function applyExplode(amount: number) {
    for (const { object, base, offset } of parts) {
      object.position.copy(base).addScaledVector(offset, amount);
    }
  }

  const introDelay = 0.35;
  const introDuration = 2.2;

  return {
    // Fit the fully exploded model; the margin absorbs sway and breathing.
    fit(width, height) {
      model.rotation.set(0, 0, 0);
      model.position.set(0, 0, 0);
      applyExplode(1.05);
      // The floor glow is a large soft plane; keep it out of the bounds.
      model.remove(floorGlow);
      fitOrthoCamera(camera, model, ISO_VIEW, width, height, SCENE_MARGIN);
      model.add(floorGlow);
    },

    update(t, dt, tilt) {
      const intro = THREE.MathUtils.clamp(
        (t - introDelay) / introDuration,
        0,
        1,
      );
      // Once the intro settles, the parts drift slightly further out and
      // back; (1 - cos) starts at 0 so there's no jump at the handoff.
      const settled = Math.max(t - introDelay - introDuration, 0);
      const breathe = 0.025 * (1 - Math.cos(settled * 0.8));
      applyExplode(easeOutCubic(intro) + breathe);

      model.rotation.y = Math.sin(t * 0.25) * 0.1 + tilt.x * 0.12;
      model.rotation.x = tilt.y * 0.05;
      model.position.y = Math.sin(t * 0.9) * 0.06;

      for (let i = 0; i < rotors.length; i++) {
        rotors[i].rotation.z -= dt * (5 + (i % 3));
      }
    },

    pose() {
      model.rotation.set(0, 0, 0);
      model.position.set(0, 0, 0);
      applyExplode(1);
    },

    setTheme(isDark) {
      applyGlowTheme(mats.halo, FAN_HALO, isDark);
      applyGlowTheme(floorGlow.material, FLOOR_GLOW, isDark);
    },
  };
}

export function PcModelScene({ className }: { className?: string }) {
  const canvasRef = useThreeScene(setupPcModel);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? 'pointer-events-none block h-full w-full'}
    />
  );
}
