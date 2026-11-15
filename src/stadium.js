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
      if (modern) await Promise.resolve().then(() => modern.dispose()).catch(() => {});
    }
  }
  renderer ??= new THREE.WebGLRenderer({ ...options, canvas: getCanvas() });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
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
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#14283e');
  gradient.addColorStop(.40, '#2c4f77');
  gradient.addColorStop(.49, '#7c7396');
  gradient.addColorStop(.55, '#e3a07c');
  gradient.addColorStop(.63, '#706a79');
  gradient.addColorStop(1, '#37465b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 256);
  for (let i=0; i<110; i++) {
    const x=(i*179.37)%1024, y=83+(i*37.13)%53, w=35+(i*11.39)%211;
    const light = ctx.createLinearGradient(x, y, x+w, y);
    light.addColorStop(0, 'transparent');
    light.addColorStop(.48, i%3 ? 'rgba(255,178,129,.115)' : 'rgba(240,213,193,.18)');
    light.addColorStop(1, 'transparent');
    ctx.fillStyle=light;
    ctx.fillRect(x,y,w,1+(i%5)*.55);
  }
  const sky = new THREE.CanvasTexture(canvas);
  sky.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(224, 32, 16),
    new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, fog: false, toneMapped: false }));
  mesh.name='Cielo';
  scene.add(mesh);
  scene.fog = new THREE.FogExp2('#767f96', .0032);
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
  texture.anisotropy = compact ? 4 : 12;
  return new THREE.MeshStandardMaterial({ color: '#6b9458', map: texture, bumpMap:texture, bumpScale:compact?.012:.022, roughness: .88 });
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
  const ribbons = [];
  for (const row of [2, 6, rows-1]) {
    for (const item of tiers.filter(item => item.row === row)) {
      const point = item.point.clone();
      point.y = row*.82+.36;
      ribbons.push({point,angle:item.angle,width:item.width});
    }
  }
  details(ribbons,new THREE.BoxGeometry(1,.14,1.83),'#c1c4b6');
  model.add(ovalBand([57, 89], [49, 81], -.09, '#71817c'));
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
}

export function addTunnel(scene) {
  const tunnel = new THREE.Group();
  tunnel.name='Túnel al camarín';
  tunnel.position.set(-40, 0, -1);
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
    part(.44, 3.3, 15.3, side * 3.68, 1.65, 0, concrete);
    part(1.12, .55, 1.4, side * 4.1, .25, 7.1, cladding);
  }
  part(7.66, .46, 15.3, 0, 3.35, 0, concrete);
  part(7.45, .14, 15.3, 0, -.055, 0, cladding);
  const curve = new THREE.CatmullRomCurve3([
    [-3.7,.12,2.53],[-3.7,2.47,2.53],[-3.21,3.16,2.53],[-2.2,3.54,2.53],
    [0,3.62,2.53],[2.2,3.54,2.53],[3.21,3.16,2.53],[3.7,2.47,2.53],[3.7,.12,2.53],
  ].map(([x,y]) => new THREE.Vector3(x,y,7.52)));
  tunnel.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .23, 7),
    new THREE.MeshStandardMaterial({ color:'#b9984b',roughness:.52,metalness:.22 })));
  const lamp = new THREE.MeshBasicMaterial({ color: '#ffe9a8' });
  const strip = new THREE.MeshStandardMaterial({color:'#b67c1c',roughness:.53,metalness:.23});
  for (const side of [-1,1]) {
    part(.045,.23,15.05,side*3.449,1.19,0,strip);
    for (const z of [-6,-3,0,3,6]) {
      part(.075,.18,.78,side*3.415,.51,z,lamp);
      part(.16,3.05,.105,side*3.39,1.61,z,cladding);
    }
  }
  for (const z of [-5.6,-1.9,1.9,5.6]) part(3.6,.07,.11,0,3.05,z,lamp);
  for (const z of [-4.8,3.9]) {
    const lighting = new THREE.PointLight('#ffd89a',43,10,2);
    lighting.position.set(0,2.94,z);
    tunnel.add(lighting);
  }
  return tunnel;

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
  room.rotation.y=Math.PI/2;
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
  const panels = new THREE.MeshStandardMaterial({color:'#263f34',roughness:.73});
  part(15,.22,14,0,-.105,0,wood);
  part(8,.025,6,0,.018,0,felt,.007);
  part(15,4.5,.35,0,2.25,-6.8,panels);
  part(15,.28,14,0,4.55,0,steel);
  part(14.5,.23,.32,0,4.30,-6.55,steel);
  for (const side of [-1,1]) {
    part(.35,4.5,13.7,side*7.3,2.25,0,wall);
    part(3.87,4.5,.24,side*5.51,2.25,6.83,panels);
    for (const z of [-5,-3,-1,1,3]) {
      part(.88,2.87,1.91,side*6.55,1.50,z,steel);
      part(.13,2.76,1.74,side*6.04,1.51,z,wood);
      part(.72,.07,1.71,side*6.0,2.76,z,light,.02);
      part(.68,.18,1.72,side*6.01,.45,z,wood);
    }
    part(.95,.21,4.45,side*4.61,.58,-1.1,wood);
    for (const z of [-2.66,.47])part(.62,.5,.18,side*4.61,.29,z,steel);
    part(.08,.10,10.8,side*4.68,4.37,-.14,light,.02);
  }
  part(5.8,2.43,.22,0,2.48,-6.58,steel);
  part(5.7,.055,.18,0,1.23,-6.44,light,.018);
  const roomLight=new THREE.PointLight('#ffdc9f',145,18,2);
  roomLight.position.set(0,4.22,-2.2);
  room.add(roomLight);
  const entranceLight=new THREE.PointLight('#fff0cc',62,13,2);
  entranceLight.position.set(0,4.25,4.2);
  room.add(entranceLight);
  return room;
}
