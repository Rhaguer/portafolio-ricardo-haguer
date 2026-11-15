import * as THREE from 'three';
export class PlayerAvatar{
 constructor({number='12',uniform='#203731',trim='#ffb612',carriesBall=true} = {}) {
   this.carriesBall = carriesBall;
   this.root = new THREE.Group();
   this.model = new THREE.Group();
   this.root.add(this.model);
   this.phase = 0;
   this.throwTime = 0;
   this.celebrateTime = 0;
   this.motion = 0;

   const makeMaterial = (color, roughness = .78, metalness = 0) =>
     new THREE.MeshStandardMaterial({ color, roughness, metalness });
   const green = makeMaterial(uniform);
   const gold = makeMaterial(trim, .43, .09);
   const white = makeMaterial('#f6f4e8');
   const skin = makeMaterial('#986344');
   const graphite = makeMaterial('#27373b', .39, .23);
   const ballLeather = makeMaterial('#75452e', .86);
   const oval = new THREE.SphereGeometry(1, 20, 14);
   function fit(parent, geometry, material, position, scale = [1, 1, 1]) {
     const mesh = new THREE.Mesh(geometry, material);
     mesh.position.set(...position);
     mesh.scale.set(...scale);
     mesh.castShadow = true;
     parent.add(mesh);
     return mesh;
   }
   const shape = (parent, material, x, y, z, w, h, d) =>
     fit(parent, oval, material, [x, y, z], [w, h, d]);
   const model = this.model;
   shape(model, green, 0, 1.48, 0, .46, .41, .29);
   shape(model, green, 0, 1.68, 0, .53, .24, .29);
   shape(model, green, 0, 1.23, 0, .34, .23, .24);
   shape(model, gold, 0, .92, 0, .35, .245, .24);
   shape(model, skin, 0, 1.99, .03, .13, .14, .12);
   shape(model, graphite, 0, 2.2, .025, .345, .34, .355);
   shape(model, skin, 0, 2.13, .20, .25, .26, .20);

   const helmetShell = new THREE.SphereGeometry(.39, 32, 22, 0, Math.PI * 2, 0, Math.PI * .69);
   fit(model, helmetShell, gold, [0, 2.24, -.035], [1, 1, 1.15]);
   for (const [width, material] of [[.31, white], [.13, green]]) {
     const stripe = new THREE.SphereGeometry(.396, 10, 20, Math.PI * .5 - width / 2, width, .17, Math.PI * .635);
     fit(model, stripe, material, [0, 2.241, -.035], [1, 1, 1.15]);
   }
   const visor = new THREE.SphereGeometry(.362, 20, 10, Math.PI * .22, Math.PI * .56, 1.26, .43);
   fit(model, visor, makeMaterial('#334f4d', .31, .24), [0, 2.245, -.012], [1.02, .91, 1.14]);
   const tube = (points, radius, material, parent = model) => {
     const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
     return fit(parent, new THREE.TubeGeometry(curve, 14, radius, 6), material, [0, 0, 0]);
   };
   for (const height of [2.015, 2.11]) {
     tube([[-.33,2.19,.12],[-.32,height,.31],[-.17,height-.02,.43],[.17,height-.02,.43],[.32,height,.31],[.33,2.19,.12]], .024, graphite);
   }
   for (const side of [-1, 1]) {
     shape(model, gold, side * .335, 2.14, .018, .059, .16, .164);
     tube([[side*.17,2.016,.43],[side*.18,2.14,.424],[side*.20,2.22,.348]], .018, graphite);
   }

   this.arms = [];
   this.elbows = [];
   this.legs = [];
   this.knees = [];
   for (const side of [-1, 1]) {
     const arm = new THREE.Group();
     arm.position.set(side * .47, 1.72, 0);
     model.add(arm);
     shape(arm, green, side * .027, -.035, 0, .195, .215, .22);
     shape(arm, green, side * .035, -.207, 0, .151, .20, .157);
     const sleeve = new THREE.CylinderGeometry(.145, .137, .048, 16);
     fit(arm, sleeve, gold, [side * .035, -.275, 0]);
     fit(arm, sleeve, white, [side * .035, -.325, 0], [.96, .55, .96]);
     const elbow = new THREE.Group();
     elbow.position.set(side * .032, -.37, .009);
     arm.add(elbow);
     shape(elbow, skin, 0, -.112, 0, .099, .165, .103);
     shape(elbow, white, 0, -.255, 0, .093, .113, .09);
     this.arms.push(arm);
     this.elbows.push(elbow);

     const leg = new THREE.Group();
     leg.position.set(side * .18, .88, .002);
     model.add(leg);
     shape(leg, gold, 0, -.223, 0, .158, .285, .181);
     shape(leg, green, side * .145, -.205, 0, .024, .233, .062);
     const knee = new THREE.Group();
     knee.position.y = -.43;
     leg.add(knee);
     shape(knee, gold, 0, 0, .045, .125, .12, .135);
     shape(knee, green, 0, -.195, 0, .107, .211, .12);
     shape(knee, graphite, 0, -.383, .046, .125, .066, .204);
     shape(knee, white, 0, -.355, .056, .12, .072, .196);
     this.legs.push(leg);
     this.knees.push(knee);
   }

   const canvas = document.createElement('canvas');
   canvas.width = canvas.height = 128;
   const context = canvas.getContext('2d');
   context.textAlign = 'center';
   context.textBaseline = 'middle';
   context.font = 'bold 98px Arial';
   context.lineWidth = 5;
   context.strokeStyle = '#ffb612';
   context.strokeText(number, 64, 66);
   context.fillStyle = carriesBall ? 'white' : '#182b38';
   context.fillText(number, 64, 66);
   const jerseyNumber = new THREE.CanvasTexture(canvas);
   jerseyNumber.colorSpace = THREE.SRGBColorSpace;
   const jersey = new THREE.MeshBasicMaterial({ map: jerseyNumber, transparent: true, depthWrite: false });
   for (const side of [-1, 1]) {
     const decal = fit(model, new THREE.PlaneGeometry(.56, .5), jersey, [0, 1.53, side * .297]);
     decal.rotation.y = side < 0 ? Math.PI : 0;
     decal.castShadow = false;
   }

   if(!carriesBall)return;
   this.ball = new THREE.Group();
   this.ball.position.set(.045, -.18, .168);
   this.ball.rotation.z = -.38;
   this.elbows[1].add(this.ball);
   shape(this.ball, ballLeather, 0, 0, 0, .15, .243, .15);
   for (let i = -2; i <= 2; i++) {
     tube([[-.035,i*.032,.143],[0,i*.032,.153],[.035,i*.032,.143]], .007, white, this.ball);
   }
 }
 async loadOptional(){const modelPath=import.meta.env.DEV?'public/models/packer-player.glb':'models/packer-player.glb';const url=new URL(modelPath,document.baseURI);try{const response=await fetch(url,{method:'HEAD'});if(!response.ok||response.headers.get('content-type')?.includes('text/html'))return;const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');const gltf=await new GLTFLoader().loadAsync(url.href);const bounds=new THREE.Box3().setFromObject(gltf.scene);const size=bounds.getSize(new THREE.Vector3());gltf.scene.scale.setScalar(2.6/Math.max(size.y,.01));gltf.scene.position.y=-bounds.min.y*gltf.scene.scale.y;this.root.add(gltf.scene);this.model.visible=false;this.mixer=new THREE.AnimationMixer(gltf.scene);this.actions={};for(const clip of gltf.animations)this.actions[clip.name.toLowerCase()]=this.mixer.clipAction(clip);this.external=gltf.scene;}catch{/* Procedural avatar remains available. */}}
 update(dt, speed, sprint) {
   this.motion = THREE.MathUtils.damp(this.motion, speed ? 1 : 0, 12, dt);
   this.phase += dt * (sprint ? 16 : 10);
   this.throwTime = Math.max(0, this.throwTime - dt);
   this.celebrateTime = Math.max(0, this.celebrateTime - dt);
   const stride = Math.sin(this.phase) * .68 * this.motion;
   this.model.rotation.x = (sprint ? .19 : .115) * this.motion;
   this.model.rotation.y = Math.sin(this.phase) * .095 * this.motion;
   this.model.rotation.z = -Math.cos(this.phase) * .045 * this.motion;
   this.model.position.y = Math.abs(Math.sin(this.phase)) * .057 * this.motion + Math.sin(this.phase * .3) * .011 * (1 - this.motion);
   for (let i = 0; i < 2; i++) {
     const side = i === 0 ? -1 : 1;
     this.legs[i].rotation.x = -side * stride;
     this.knees[i].rotation.x = .06 + Math.max(0, side * stride) * (sprint ? 1.25 : 1.02);
     this.arms[i].rotation.x = side * stride * (i === 1 ? .58 : .9);
     this.arms[i].rotation.z = side * .12;
     this.elbows[i].rotation.x = i === 1 && this.carriesBall ? -.79 : -.22 - Math.abs(stride) * .35;
     if (this.celebrateTime) {
       this.arms[i].rotation.z = side * 2.55;
       this.elbows[i].rotation.x = -.16;
       this.model.position.y = Math.abs(Math.sin(this.celebrateTime * 8)) * .52;
     }
   }
   if (this.throwTime) {
     const windup = 1 - this.throwTime / .66;
     this.model.rotation.y = Math.sin(windup * Math.PI * 2) * .37;
     this.arms[1].rotation.x = -2.47 * Math.sin(windup * Math.PI);
     this.elbows[1].rotation.x = -.98 + Math.sin(windup * Math.PI) * .67;
   }
   if (this.mixer) {
     const key = this.celebrateTime ? 'celebration' : this.throwTime ? 'throw'
       : speed ? (sprint ? 'sprint' : 'run') : 'idle';
     const action = this.actions[key] || this.actions[speed ? 'run' : 'idle'];
     if (action && action !== this.current) {
       this.current?.fadeOut(.2);
       action.reset().fadeIn(.2).play();
       this.current = action;
     }
     this.mixer.update(dt);
   }
 }
 throw() { this.throwTime = .66; }
 releaseBall(position) {
   if (this.external) return this.root.getWorldPosition(position).add(new THREE.Vector3(.4, 1.65, .22));
   this.ball.getWorldPosition(position);
   this.ball.visible = false;
   return position;
 }
 recoverBall() { this.ball.visible = true; }
 celebrate() { this.celebrateTime = 1.6; }
}
