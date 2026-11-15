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
  mesh.name='Cielo';
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
  const seats = [];
  const railings = [];
  for (const item of tiers) {
    if (item.stair) {
      const center = item.point.clone();
      center.y = item.row * .82 + 1.49;
      railings.push({ point: center, angle: item.angle, width: 1.55 });
      continue;
    }
    const tangent = new THREE.Vector3(Math.cos(item.angle), 0, -Math.sin(item.angle));
    for (const offset of [-.65, .55]) {
      const seat = item.point.clone().addScaledVector(tangent, offset * Math.min(1.6, item.width * .42));
      seat.y = item.row * .82 + .91;
      seats.push({ point: seat, angle: item.angle, color: item.row % 4 === 0 ? '#b4873b' : '#294b40' });
    }
  }
  function details(items, geometry, tint) {
    const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({ color: tint, roughness: .58, metalness: .18 }), items.length);
    items.forEach((item, i) => {
      pose.position.copy(item.point);
      pose.rotation.set(0, item.angle, 0);
      pose.scale.set(item.width || 1, 1, 1);
      pose.updateMatrix();
      mesh.setMatrixAt(i, pose.matrix);
      if (item.color) mesh.setColorAt(i, color.set(item.color));
    });
    mesh.receiveShadow = true;
    model.add(mesh);
    return mesh;
  }
  const seatsMesh = details(seats, new RoundedBoxGeometry(.49, .43, .18, 1, .045), '#ffffff');
  details(railings, new THREE.BoxGeometry(.82, .055, .055), '#c0bbac');
  for (const sign of [-1, 1]) {
    for (let section = -2; section <= 2; section++) {
      const length = 14;
      const suite = new THREE.Mesh(new RoundedBoxGeometry(3.5, 2.3, length, 1, .15),
        new THREE.MeshStandardMaterial({ color: '#52655b', roughness: .74 }));
      suite.position.set(sign * (43 + rows * .6), rows * .82 + 1.15, section * 15);
      model.add(suite);
      const windows = new THREE.Mesh(new THREE.BoxGeometry(.07, 1.28, length - .9),
        new THREE.MeshStandardMaterial({ color: '#50706d', roughness: .34, metalness: .3, emissive: '#473721', emissiveIntensity: .26 }));
      windows.position.copy(suite.position);
      windows.position.x -= sign * 1.77;
      model.add(windows);
    }
  }
  return { setDetail(mode) {
    const count = mode === 'light' ? .42 : mode === 'balanced' ? .72 : 1;
    bodies.count = heads.count = Math.floor(occupancy.length * count);
    seatsMesh.count = Math.floor(seats.length * (mode === 'light' ? .68 : 1));
  }};
  model.add(ovalBand([57, 89], [49, 81], -.09, '#71817c'));
}

export function addTunnel(scene) {
  const tunnel = new THREE.Group();
  tunnel.position.set(-35, 0, -1);
  tunnel.rotation.y = Math.PI / 2;
  scene.add(tunnel);
  const concrete = new THREE.MeshStandardMaterial({ color: '#5f6c63', roughness: .88 });
  const cladding = new THREE.MeshStandardMaterial({ color: '#223c34', roughness: .72 });
  function part(width, height, depth, x, y, z, material, parent = tunnel) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 1, .09), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  for (const side of [-1, 1]) {
    part(.44, 3.3, 8.6, side * 3.68, 1.65, -1.8, concrete);
    part(1.12, .55, 1.4, side * 4.1, .25, 2.9, cladding);
  }
  part(7.66, .46, 8.6, 0, 3.35, -1.8, concrete);
  part(7.45, .14, 8.6, 0, .015, -1.8, cladding);
  part(7.4, 3.3, .20, 0, 1.65, -6, cladding);
  const curve = new THREE.CatmullRomCurve3([
    [-3.7,.12,2.53],[-3.7,2.47,2.53],[-3.21,3.16,2.53],[-2.2,3.54,2.53],
    [0,3.62,2.53],[2.2,3.54,2.53],[3.21,3.16,2.53],[3.7,2.47,2.53],[3.7,.12,2.53],
  ].map(point => new THREE.Vector3(...point)));
  tunnel.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .23, 7),
    new THREE.MeshStandardMaterial({ color:'#b9984b',roughness:.52,metalness:.22 })));
  const lamp = new THREE.MeshBasicMaterial({ color: '#ffe9a8' });
  for (const z of [-4.65, -2.35, -.05, 1.68]) part(3.6,.09,.12,0,3.05,z,lamp);
}

export function contactShadow(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  const fade = context.createRadialGradient(32, 32, 2, 32, 32, 31);
  fade.addColorStop(0, '#000a');
  fade.addColorStop(1, '#0000');
  context.fillStyle = fade;
  context.fillRect(0, 0, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(canvas), transparent: true, opacity: .65, depthWrite: false, polygonOffset:true, polygonOffsetFactor:-1,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = .074;
  scene.add(mesh);
  return mesh;
}

export function addLockerRoom(scene, center) {
  const room = new THREE.Group();
  room.name = 'Camarín';
  room.position.copy(center);
  scene.add(room);
  const wood = new THREE.MeshStandardMaterial({color:'#815e41',roughness:.82});
  const steel = new THREE.MeshStandardMaterial({color:'#263c3b',roughness:.56,metalness:.23});
  const wall = new THREE.MeshStandardMaterial({color:'#8f9d92',roughness:.8});
  const felt = new THREE.MeshStandardMaterial({color:'#234638',roughness:.96});
  const light = new THREE.MeshBasicMaterial({color:'#ffe6af'});
  function part(w,h,d,x,y,z,material,radius=.045) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w,h,d,1,radius),material);
    mesh.position.set(x,y,z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    room.add(mesh);
    return mesh;
  }
  part(15,.22,14,0,-.095,0,wood);
  part(8,.025,6,0,.022,0,felt,.007);
  part(15,4.5,.35,0,2.25,-6.8,wall);
  part(.35,3.9,13.7,-7.3,1.95,0,wall);
  part(14.5,.23,.32,0,4.56,-6.55,steel);
  for(const x of [-5.65,-3.38,-1.13,1.13,3.38,5.65]){
    part(2.08,2.75,.86,x,1.49,-5.86,steel);
    part(1.74,2.45,.076,x,1.50,-5.37,wood);
    part(.085,.34,.08,x+.62,1.47,-5.28,steel);
    part(1.68,.065,.08,x,2.57,-5.27,light,.02);
  }
  for (const x of [-4.6,4.6]) {
    part(3.86,.21,1.24,x,.58,-2.8,wood);
    for(const leg of [-1.55,1.55])part(.13,.51,1.04,x+leg,.28,-2.8,steel);
  }
  part(2.65,.15,1.02,0,1.15,-.2,wood);
  part(.28,1.15,.54,0,.57,-.2,steel);
  const roomLight=new THREE.PointLight('#ffdc9f',110,17,2);
  roomLight.position.set(0,5,-3);
  room.add(roomLight);
  room.visible=false;
  return room;
}
