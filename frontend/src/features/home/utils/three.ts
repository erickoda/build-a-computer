import * as THREE from 'three';

// ─── Shared three.js helpers ──────────────────────────────────────────────────
// Small building blocks used by the procedural landing-page scenes
// (pc-model-scene.tsx, benchmark-chart-scene.tsx).

// Isometric-ish direction both scenes are viewed from, so they read as a pair.
export const ISO_VIEW = new THREE.Vector3(-1, 0.8, 1).normalize();

// How a glow looks in each theme. In dark mode glows are additive light
// bleed. Against the light page additive blending just washes out to white,
// so there they become a normal-blended, deeper tint instead — the same
// "glow becomes ink" idea as the light palette in mote-field.tsx.
export type GlowLook = { color: number; opacity: number };
export type GlowTheme = { dark: GlowLook; light: GlowLook };

export function makeGlowMaterial(map: THREE.Texture) {
  return new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

export function applyGlowTheme(
  material: THREE.MeshBasicMaterial,
  theme: GlowTheme,
  isDark: boolean,
) {
  const look = isDark ? theme.dark : theme.light;
  material.color.setHex(look.color);
  material.opacity = look.opacity;
  material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
}

// Soft radial gradient used for every glow halo; additive blending lets
// overlapping halos build up like real light bleed.
export function makeGlowTexture(ring: boolean) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  if (ring) {
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.62, 'rgba(255,255,255,0)');
    g.addColorStop(0.8, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
  } else {
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

// Seeded PRNG so procedural details look the same on every load.
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Fit margin shared by both landing scenes so their models come out the
// same size. The canvas bleeds 30% past the model box on each side (see
// Panel in home.tsx), so 1.6 fills the box exactly; the rest leaves room
// for the sway and tilt animations.
export const SCENE_MARGIN = 1.75;

// Point an orthographic camera at `object` along `viewDirection` and size
// its frustum so the object's on-screen silhouette fills the viewport, times
// `margin`. The fit projects every vertex rather than the bounding-box
// corners: box corners overestimate the silhouette by a different amount
// for each model, which left the two landing scenes at different sizes and
// off-center in their squares. Glow sprites (see isGlow) are skipped, since
// their quads are mostly transparent.
export function fitOrthoCamera(
  camera: THREE.OrthographicCamera,
  object: THREE.Object3D,
  viewDirection: THREE.Vector3,
  width: number,
  height: number,
  margin = 1.02,
) {
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());

  camera.position.copy(center).addScaledVector(viewDirection, 30);
  camera.lookAt(center);
  camera.updateMatrixWorld(true);

  const toView = new THREE.Matrix4();
  const p = new THREE.Vector3();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  object.traverseVisible((node) => {
    const mesh = node as THREE.Mesh;
    const position = mesh.geometry?.attributes.position;
    if (!position || isGlow(mesh)) return;
    toView.multiplyMatrices(camera.matrixWorldInverse, mesh.matrixWorld);
    for (let i = 0; i < position.count; i++) {
      p.fromBufferAttribute(position, i).applyMatrix4(toView);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  });

  const halfW = ((maxX - minX) / 2) * margin;
  const halfH = ((maxY - minY) / 2) * margin;
  const cx = (maxX + minX) / 2;
  const cy = (maxY + minY) / 2;
  const aspect = width / height;
  const fitHalfH = Math.max(halfH, halfW / aspect);
  camera.left = cx - fitHalfH * aspect;
  camera.right = cx + fitHalfH * aspect;
  camera.top = cy + fitHalfH;
  camera.bottom = cy - fitHalfH;
  camera.updateProjectionMatrix();
}

// Additive glow quads from makeGlowMaterial: textured, no depth write.
function isGlow(mesh: THREE.Mesh) {
  const material = mesh.material;
  return (
    material instanceof THREE.MeshBasicMaterial &&
    material.map !== null &&
    !material.depthWrite
  );
}

// Geometries, materials and textures are shared between meshes, so collect
// them into sets before disposing each exactly once.
export function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      geometries.add(object.geometry);
      const material = object.material as THREE.Material | THREE.Material[];
      for (const m of Array.isArray(material) ? material : [material]) {
        materials.add(m);
        for (const value of Object.values(m)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}
