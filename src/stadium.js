import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export async function createRenderer(getCanvas, compact) {
  const options = { antialias: true, powerPreference: compact ? 'default' : 'high-performance' };
  let renderer;
  if (navigator.gpu) {
    let modern;
    try {
      const { WebGPURenderer } = await import('three/webgpu');
      modern = new WebGPURenderer({ ...options, canvas: getCanvas() });
      await modern.init();
      renderer = modern;
    } catch {
      void modern?.dispose().catch(() => {});
    }
  }
  renderer ??= new THREE.WebGLRenderer({ ...options, canvas: getCanvas() });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return {
    renderer,
    backend: renderer.backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL 2',
  };
}

export function addAtmosphere(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#354d64');
  gradient.addColorStop(.42, '#7493a0');
  gradient.addColorStop(.59, '#bac9c9');
  gradient.addColorStop(.79, '#e3d1af');
  gradient.addColorStop(1, '#a6acab');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 256);
  const sky = new THREE.CanvasTexture(canvas);
  sky.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(224, 32, 16),
    new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, fog: false, toneMapped: false }));
  scene.add(mesh);
  scene.fog = new THREE.FogExp2('#adbfc4', .005);
}

export function turfMaterial(compact) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  let seed = 58731;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  ctx.fillStyle = '#839487';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 23500; i++) {
    const shade = 105 + random() * 105;
    ctx.fillStyle = `rgba(${shade},${shade + 18},${shade + 1},.55)`;
    ctx.fillRect(random() * 512, random() * 512, 1 + random() * 2, 2 + random() * 5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(13, 25);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = compact ? 2 : 8;
  return new THREE.MeshStandardMaterial({ color: '#537c55', map: texture, roughness: .92 });
}

function ovalBand(outer, inner, height, color) {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, outer[0], outer[1], 0, Math.PI * 2);
  const cut = new THREE.Path();
  cut.absellipse(0, 0, inner[0], inner[1], 0, Math.PI * 2, true);
  shape.holes.push(cut);
  const geometry = new THREE.ShapeGeometry(shape, 64);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .87 }));
  mesh.position.y = height;
  mesh.receiveShadow = true;
  return mesh;
}

export function addGrandstands(scene, compact) {
  const model = new THREE.Group();
  model.name = 'Gradas curvas';
  scene.add(model);
  const turn = Math.PI * 2;
  const step = 1.53;
  const rows = compact ? 8 : 10;
  const oval = (index, angle) => {
    // Superellipse: broad sidelines with smoothly joined corners.
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    return new THREE.Vector3(Math.sign(x) * Math.sqrt(Math.abs(x)) * (34 + index * step), 0,
      Math.sign(z) * Math.sqrt(Math.abs(z)) * (66 + index * step));
  };
  const tiers = [];
  const occupancy = [];
  const colors = ['#183f2d', '#295940', '#4a604a', '#bd8c29', '#edbe56', '#ccd2c2', '#374955'];
  for (let row = 0; row < rows; row++) {
    for (let section = 0; section < 96; section++) {
      const theta = turn * (section + .5) / 96;
      const current = oval(row, theta);
      if (current.x < -26 && Math.abs(current.z + 1) < 7) continue;
      const left = oval(row, turn * section / 96);
      const right = oval(row, turn * (section + 1) / 96);
      const delta = right.sub(left);
      tiers.push({ point: current, width: delta.length() + .07, angle: -Math.atan2(delta.z, delta.x), row, stair: section % 12 === 3 });
      if (section % 12 !== 3 && section % 3 !== 1) {
        const offset = oval(row + .18, theta);
        occupancy.push({ point: offset, row, color: colors[(row * 13 + section * 7 + Math.floor(section / 3)) % colors.length] });
      }
    }
  }
  const stand = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 1, .055),
    new THREE.MeshStandardMaterial({ roughness: .86 }), tiers.length);
  const bodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.24, .27, 3, 6),
    new THREE.MeshStandardMaterial({ roughness: .9 }), occupancy.length);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(.152, 7, 5),
    new THREE.MeshStandardMaterial({ roughness: .9 }), occupancy.length);
  const pose = new THREE.Object3D();
  const color = new THREE.Color();
  for (const [i, item] of tiers.entries()) {
    pose.position.copy(item.point);
    pose.position.y = item.row * .82 + .18;
    pose.scale.set(item.width, 1.07, 1.81);
    pose.rotation.y = item.angle;
    pose.updateMatrix();
    stand.setMatrixAt(i, pose.matrix);
    stand.setColorAt(i, color.set(item.stair ? '#77847f' : item.row % 3 === 0 ? '#526760' : '#455952'));
  }
  pose.rotation.y = 0;
  pose.scale.setScalar(1);
  for (const [i, person] of occupancy.entries()) {
    pose.position.copy(person.point);
    pose.position.y = person.row * .82 + .98;
    pose.updateMatrix();
    bodies.setMatrixAt(i, pose.matrix);
    bodies.setColorAt(i, color.set(person.color));
    pose.position.y += .42;
    pose.updateMatrix();
    heads.setMatrixAt(i, pose.matrix);
    heads.setColorAt(i, color.set(i % 3 === 0 ? '#805842' : i % 3 === 1 ? '#c99f77' : '#343d35'));
  }
  stand.receiveShadow = true;
  model.add(stand, bodies, heads);
  model.add(ovalBand([57, 89], [49, 81], -.09, '#71817c'));
}

export function roundedArch(x, z) {
  const paths = [
    new THREE.Vector3(-3.5, .12, 0), new THREE.Vector3(-3.5, 3.1, 0),
    new THREE.Vector3(-3.15, 4.4, 0), new THREE.Vector3(-2.1, 5.12, 0),
    new THREE.Vector3(0, 5.25, 0), new THREE.Vector3(2.1, 5.12, 0),
    new THREE.Vector3(3.15, 4.4, 0), new THREE.Vector3(3.5, 3.1, 0),
    new THREE.Vector3(3.5, .12, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(paths);
  const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, .18, 8, false),
    new THREE.MeshStandardMaterial({ color: '#f1b944', metalness: .31, roughness: .35, emissive: '#995617', emissiveIntensity: .3 }));
  arch.position.set(x, 0, z);
  arch.castShadow = true;
  return arch;
}
