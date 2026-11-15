import * as THREE from 'three';
import {PlayerAvatar} from './avatar.js';
import {createDefense} from './defense.js';
import {createReceiver} from './receiver.js';
import {createCameraCollision} from './follow-camera.js';
import { addAtmosphere, addGrandstands, addLockerRoom, addTunnel, contactShadow, createRenderer, turfMaterial } from './stadium.js';
const GREEN='#203731',GOLD='#FFB612';
const tunnelZ=-1, tunnelMouth=-32.25, tunnelEnd=-47.62, lockerX=-54.45;
const insideTunnel = pos => pos.x<tunnelMouth && Math.abs(pos.z-tunnelZ)<3.4;
export async function createGame({container,projects,onOpen,onProject,onZone,onTouchdown,onFailure,onStatus=()=>{},onRoom=()=>{},onQuality=()=>{},onDestinations=()=>{}}){
 const scene = new THREE.Scene();
 const compact = matchMedia('(pointer: coarse)').matches;
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const {renderer, backend} = await createRenderer(() => document.createElement('canvas'), compact);
 const viewport = () => ({width:container.clientWidth || innerWidth,height:container.clientHeight || innerHeight});
 let {width,height}=viewport();
 renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.18 : 1.55));
 renderer.setSize(width,height,false);
 container.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.domElement.addEventListener('webglcontextlost', onFailure, {once:true});
 if (backend === 'WebGPU') {
   const deviceLost = renderer.onDeviceLost.bind(renderer);
   renderer.onDeviceLost = info => { deviceLost(info); onFailure(); };
 }
 const camera = new THREE.PerspectiveCamera(46, width / height, .1, 310);
 camera.position.set(-11, 12.5, 23);
 addAtmosphere(scene);
 scene.add(new THREE.HemisphereLight('#bdccf4', '#55594b', 1.28));
 const sun = new THREE.DirectionalLight('#ffca9d', 2.37);
 sun.position.set(-54, 35, -40);
 sun.castShadow = true;
 sun.shadow.mapSize.set(compact ? 768 : 1536, compact ? 768 : 1536);
 Object.assign(sun.shadow.camera, {left:-59,right:59,top:74,bottom:-74,near:1,far:174});
 sun.shadow.normalBias = .035;
 sun.shadow.bias = -.00025;
 scene.add(sun);
 const solids=[];
 const materials=new Map();function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.86}));return materials.get(color)}
 function box(w,h,d,color,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=h>.1;parent.add(m);if(h>.28&&y>=.3)solids.push(m);return m}
 function cylinder(radius,height,color,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,12),material(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);solids.push(m);return m}
 function textTexture(text,{bg=GREEN,color='#ffffff',width=1024,height=160,size=70}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);}ctx.fillStyle=color;ctx.font=`800 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,width/2,height/2,width-35);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
 function sign(text,x,y,z,w=10,h=1.5,color='#fff'){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(text,{color}),side:THREE.DoubleSide}));mesh.position.set(x,y,z);scene.add(mesh);return mesh}
 function groundText(text,x,z,w=10,h=4,color='#fff',bg=null){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(text,{color,bg}),side:THREE.DoubleSide,transparent:!bg,depthWrite:!!bg}));m.rotation.x=-Math.PI/2;m.position.set(x,.065,z);scene.add(m);return m}
 const plaza = new THREE.Mesh(new THREE.CircleGeometry(1, 96),
   new THREE.MeshStandardMaterial({color:'#738079',roughness:.96}));
 plaza.rotation.x=-Math.PI/2;
 plaza.scale.set(63,92,1);
 plaza.position.y=-.14;
 plaza.receiveShadow=true;
 scene.add(plaza);
 box(65,.20,121,'#314c3b',0,-.12,0);
 const turf = turfMaterial(compact);
 const field = new THREE.Mesh(new THREE.PlaneGeometry(54,96),turf);
 field.rotation.x=-Math.PI/2;field.position.y=.012;field.receiveShadow=true;scene.add(field);
 const stripeGeometry = new THREE.PlaneGeometry(54,9.6);
 const stripeMaterial = new THREE.MeshStandardMaterial({color:'#b4c778',transparent:true,opacity:.12,depthWrite:false});
 for(let i=0;i<10;i+=2){const strip=new THREE.Mesh(stripeGeometry,stripeMaterial);strip.rotation.x=-Math.PI/2;strip.position.set(0,.018,-43.2+i*9.6);strip.receiveShadow=true;scene.add(strip);}
 for(const x of [-27,27])box(.13,.04,116,'#ffffff',x,.05,0);
 for(let i=0;i<=10;i++){const z=-48+i*9.6;box(54,.05,.11,i===0||i===10?GOLD:'#ffffff',0,.05,z);if(i>0&&i<10){for(const x of [-21,21]){let m=groundText(String(i<=5?i*10:(10-i)*10),x,z+1.3,3.5,2,'#ffffff');if(x>0)m.rotation.z=Math.PI}}}

 for(const z of [-54,54]){box(54,.05,10,GREEN,0,.02,z);for(const x of [-27,27])box(.16,.06,11,GOLD,x,.05,z);box(54,.06,.18,GOLD,0,.05,z+Math.sign(z)*5);groundText(z<0?'HAGUER':'PORTFOLIO',0,z,30,5,GOLD)}

 // Instanced seating, spectators, and floodlights share geometry and materials.
 const temp=new THREE.Object3D();function instances(items,geometry,mat){const mesh=new THREE.InstancedMesh(geometry,mat,items.length);items.forEach((p,i)=>{temp.position.set(p.x,p.y,p.z);temp.scale.set(p.sx||1,p.sy||1,p.sz||1);temp.rotation.set(0,0,0);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);if(p.color)mesh.setColorAt(i,new THREE.Color(p.color))});mesh.receiveShadow=true;scene.add(mesh);return mesh}
 const hashes=[];for(let i=0;i<50;i++)for(const x of [-3,3,-26,26])hashes.push({x,y:.05,z:-47+i*1.92});
 instances(hashes,new THREE.BoxGeometry(.65,.04,.08),material('#ffffff'));
 const stands = addGrandstands(scene, compact);
 // Low perimeter walls follow the service lane. Leave the west tunnel aperture open.
 box(.46,2.12,120,'#203a33',33.3,1.06,0);
 box(.46,2.12,57.5,'#203a33',-33.3,1.06,-34.1);
 box(.46,2.12,56.7,'#203a33',-33.3,1.06,32.2);
 for(const z of [-63.2,63.2])box(66.5,1.98,.52,'#203a33',0,.99,z);
 const lamps=[];for(const x of [-43,43])for(const z of [-64,64]){const flood=new THREE.SpotLight('#fff7d6',1900,72,.64,.65,2);flood.position.set(x,20,z);flood.target.position.set(x*.40,0,z*.42);scene.add(flood,flood.target);cylinder(.22,20,'#627568',x,10,z);for(let i=0;i<6;i++)lamps.push({x:x+(i%3-1)*.95,y:20+Math.floor(i/3)*.75,z,sx:.8,sy:.55,sz:.6});}instances(lamps,new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#fff8d3',emissive:'#fff1a0',emissiveIntensity:1}));
 // Tunnel and profile mat.
 const tunnel = addTunnel(scene);
 const tunnelSign=sign('TÚNEL  /  CAMARÍN',tunnelMouth+.12,3.82,tunnelZ,7.5,.84,GOLD);
 tunnelSign.rotation.y=Math.PI/2;
 const lockerCenter = new THREE.Vector3(lockerX,0,tunnelZ);
 const locker = addLockerRoom(scene,lockerCenter);
 tunnel.traverse(object=>{if(object.userData.cameraSolid)solids.push(object);});
 locker.traverse(object=>{if(object.userData.cameraSolid)solids.push(object);});
 const lockerSign=sign('CONTACTO',0,2.49,-6.44,5.42,2.12,'#f4f8ed');
 locker.add(lockerSign);
 const playerShadow = contactShadow(scene);
 for (const z of [-59,59]) {
   const shadow = contactShadow(scene);
   shadow.position.set(0,.073,z);
   shadow.scale.set(1.66,.71,1);
 }
 const player=new PlayerAvatar();
 player.root.position.set(1,0,19);
 player.root.rotation.y=Math.PI;
 scene.add(player.root);
 player.loadOptional();
 const zones=[{x:-22,z:-52,label:'Aplicaciones web',kind:'Desarrollo web',portal:true},{x:22,z:-52,label:'Automatización',kind:'Automatización',portal:true},{x:-22,z:52,label:'Datos e IoT',kind:'IoT y datos',portal:true},{x:22,z:52,label:'Móvil',kind:'Aplicaciones móviles',portal:true},{x:-29,z:8,label:'Perfil & experiencia',kind:'profile'},{x:29,z:0,label:'Stack & metodología',kind:'skills'},{x:-30,z:tunnelZ,label:'Túnel al camarín',kind:'tunnel',features:[tunnelSign]}];
 for (const zone of zones.filter(z => z.portal)) {
   const side=Math.sign(zone.z);
   const panelZ=side*62.4;
   box(21,1.40,.55,'#203b35',zone.x,1.28,panelZ);
   box(21,.12,.6,'#799084',zone.x,.58,panelZ);
   const label=sign(zone.label.toUpperCase(),zone.x,1.3,panelZ-side*.29,19.4,1.18,'#ffe5a0');
   label.rotation.y=side>0?Math.PI:0;
   zone.features=[label];
 }
 for(const z of [-59,59]){
   cylinder(.18,4,GOLD,0,2,z);
   const bar=cylinder(.15,11,GOLD,0,4,z);
   bar.rotation.z=Math.PI/2;
   for(const x of [-5.5,5.5])cylinder(.13,5,GOLD,x,6.5,z);
 }
 const boardFrame=new THREE.Mesh(new THREE.BoxGeometry(34.1,11.38,.9),material('#111f1e'));
 boardFrame.position.set(0,13,-69.1);
 scene.add(boardFrame);
 const scoreboardSupport = new THREE.Group();
 scene.add(scoreboardSupport);
 for (const x of [-13,13]) {
   box(1.65,.38,2.15,'#657369',x,.22,-70,scoreboardSupport);
   box(.52,9,1.12,'#374e48',x,4.65,-70,scoreboardSupport);
 }
 box(26,.54,1.7,'#43554e',0,8.5,-70,scoreboardSupport);
 let scoreboardTexture;const boardCanvas=document.createElement('canvas');boardCanvas.width=1536;boardCanvas.height=640;const boardCtx=boardCanvas.getContext('2d');scoreboardTexture=new THREE.CanvasTexture(boardCanvas);scoreboardTexture.colorSpace=THREE.SRGBColorSpace;
 box(33,11,1,GREEN,0,13,-69);const board=new THREE.Mesh(new THREE.PlaneGeometry(31,9.6),new THREE.MeshBasicMaterial({map:scoreboardTexture}));board.position.set(0,13,-68.4);scene.add(board);for(const x of [-13,13])cylinder(.4,10,GREEN,x,5,-69);
 function score(label,flash=false){
   const ctx=boardCtx;
   const background=ctx.createLinearGradient(0,0,1536,640);
   background.addColorStop(0,flash?'#f3ad29':'#1e4938');
   background.addColorStop(1,flash?'#d0891d':'#0a221b');
   ctx.fillStyle=background;ctx.fillRect(0,0,1536,640);
   ctx.fillStyle=flash?GREEN:GOLD;ctx.fillRect(53,50,11,478);
   ctx.fillRect(1473,50,11,478);
   ctx.textAlign='center';
   ctx.fillStyle=flash?GREEN:'#fff9dc';
   ctx.font='900 112px Arial';
   ctx.fillText('RICARDO HAGUER',768,235,1310);
   ctx.font='700 43px Arial';
   ctx.fillText('SOFTWARE · DATOS · AUTOMATIZACIÓN',768,344,1300);
   ctx.fillStyle=flash?GREEN:GOLD;
   ctx.fillRect(578,393,380,10);
   ctx.font='700 34px Arial';
   ctx.fillText(label.toUpperCase(),768,492,1300);
   ctx.fillStyle=flash?GREEN:'#c3d8c9';
   ctx.font='600 29px Arial';
   ctx.fillText(projects.length+' PROYECTOS · '+new Set(projects.map(p=>p.category)).size+' ÁREAS',768,559);
   scoreboardTexture.needsUpdate=true;
 }
 score('Recorrido libre');
 // Flush numbered markers keep the receivers easy to find while leaving the field clear.
 const featured=projects.filter(p=>p.featured);
 for(const p of projects)if(featured.length<4&&!featured.includes(p))featured.push(p);
 const targets=featured.slice(0,4).map((p,i)=>{
   const x=i%2?13:-13,z=[-28.8,-9.6,9.6,28.8][i];
   const marker=groundText('+ '+String(i+1),x,z,3.6,2.7,'#edf8e9');
   return {x,z,p,marker};
 });
 scene.updateMatrixWorld(true);
 const collision=createCameraCollision(solids);
 const teammate=createReceiver(scene);
 const snowCount=320;
 const snowflakes=Array.from({length:snowCount},()=>({x:(Math.random()-.5)*90,y:Math.random()*35,z:(Math.random()-.5)*140}));
 const snow=instances(snowflakes,new THREE.OctahedronGeometry(.105),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.76,depthWrite:false}));
 snow.receiveShadow=false;snow.frustumCulled=false;snow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);snow.visible=false;
 const confettiItems=Array.from({length:90},(_,i)=>({x:0,y:-5,z:0,color:i%2?GOLD:GREEN}));const confetti=instances(confettiItems,new THREE.BoxGeometry(.14,.25,.08),material('#ffffff'));const confettiVel=confettiItems.map(()=>new THREE.Vector3());let confettiTime=0;
 confetti.frustumCulled=false;confetti.receiveShadow=false;confetti.visible=false;
 let muted=true,audio=null,paused=false,hidden=false,current=null,lastInteraction='',zoneLock=null,flight=null,zoom=0,elapsed=0,celebration=null,mapOpen=false;
 let cameraYaw=.065,cameraPitch=.39,smoothedYaw=cameraYaw,smoothedPitch=cameraPitch;
 let snapView=true;
 let playMode=false, inLocker=false, inTunnel=false, playerStun=0, defenderWarning=false;
 let replay=null, ambience=null, assistedWalk=false, returnBallIn=0;
 const replayView=new THREE.Vector3(0,12,-41), replayLook=new THREE.Vector3(0,12.7,-69);
 const defense=createDefense(scene,()=>{
   playerStun=.8;
   motion.set(0,0);
   if(flight&&!flight.released){
     scene.remove(flight.ball);
     player.recoverBall();
     player.throwTime=0;
     flight=null;
   }
   onStatus('Tackle. Vuelve a moverte para seguir la jugada.');
 });
 function stopMovement() {
   assistedWalk=false;
   clearInput();
   motion.set(0,0);
   playerStun=0;
   if(returnBallIn>0){returnBallIn=0;player.recoverBall();}
   if(flight){scene.remove(flight.ball);flight=null;player.recoverBall();player.throwTime=0;}
 }
 function cueProject(project) {
   if(reducedMotion||inTunnel||inLocker){onProject(project);return;}
   if(replay)return;
   stopMovement();
   replay={project,remaining:.58};
   score(project.title);
 }
 function guideToTunnel() {
   if(inTunnel||inLocker)return;
   stopMovement();
   replay=null;
   player.root.position.set(-30,0,tunnelZ);
   player.root.rotation.y=-Math.PI/2;
   cameraYaw=Math.PI/2;
   cameraPitch=.25;
   mapOpen=false;
   snapView=true;
   lastInteraction='';
 }
 function leaveLocker() {
   stopMovement();
   inLocker=false;
   inTunnel=false;
   player.root.position.set(-29.8,0,tunnelZ+5.2);
   player.root.rotation.y=Math.PI/2;
   cameraYaw=0;
   cameraPitch=defaultPitch;
   snapView=true;
   onRoom(false);
   updateAmbience();
   lastInteraction='';
 }
 function movePlayer(pos, dt) {
   const previousX=pos.x;
   const previousZ=pos.z;
   const x=pos.x+motion.x*dt;
   const z=pos.z+motion.y*dt;
   const channel=Math.abs(previousZ-tunnelZ)<3.15;
   if (previousX<tunnelEnd) {
     pos.x=THREE.MathUtils.clamp(x,-60.12,channel?-29: tunnelEnd-.23);
     pos.z=THREE.MathUtils.clamp(z,tunnelZ-4.0,tunnelZ+4.0);
   } else if (previousX<tunnelMouth || (x<tunnelMouth&&channel)) {
     pos.x=THREE.MathUtils.clamp(x,-60.12,31);
     pos.z=THREE.MathUtils.clamp(z,tunnelZ-3.14,tunnelZ+3.14);
   } else {
     pos.x=THREE.MathUtils.clamp(x,channel?tunnelMouth:-31.85,31);
     pos.z=THREE.MathUtils.clamp(z,-60,60);
   }
 }
 const defaultYaw=cameraYaw,defaultPitch=cameraPitch;
 const motion=new THREE.Vector2();
 const nearMarker = new THREE.Mesh(new THREE.RingGeometry(.8,1,38),
   new THREE.MeshBasicMaterial({color:'#dff5e8',side:THREE.DoubleSide,transparent:true,depthWrite:false}));
 nearMarker.rotation.x=-Math.PI/2;
 nearMarker.visible=false;
 scene.add(nearMarker);
 let mode='auto', detail=compact?'balanced':'high', snowEnabled=false;
 let qualityTime=0, qualityFrames=0, slowWindows=0;
 const graphicsModes = ['light','balanced','high'];
 function syncSnow() {
   snow.count = Math.floor(snowCount * (detail==='light'?.19:detail==='balanced'?.45:1));
   snow.visible = snowEnabled;
 }
 function applyDetail(next) {
   detail=next;
   const ratio=next==='light'?.83:next==='balanced'?1.14:1.85;
   renderer.setPixelRatio(Math.min(devicePixelRatio,ratio));
   renderer.shadowMap.enabled=next!=='light';
   sun.castShadow=next!=='light';
   stands.setDetail(next);
   turf.map.anisotropy=next==='high'?12:4;
   syncSnow();
   onQuality(next);
 }
 function setQuality(next) {
   if (!['auto','light','high'].includes(next)) return;
   mode=next;
   qualityTime=qualityFrames=slowWindows=0;
   applyDetail(next==='auto' ? (compact?'balanced':'high') : next);
 }
 function measureQuality(seconds) {
   if (mode!=='auto') return;
   qualityTime+=Math.min(seconds,.25);
   qualityFrames++;
   if (qualityTime<2.5) return;
   slowWindows=qualityFrames/qualityTime<37 ? slowWindows+1 : 0;
   if (slowWindows>=2&&detail!=='light') {
     applyDetail(graphicsModes[graphicsModes.indexOf(detail)-1]);
     slowWindows=0;
   }
   qualityTime=qualityFrames=0;
 }
 const audioContext=window.AudioContext||window.webkitAudioContext;
 function updateAmbience() {
   if (!ambience) return;
   const volume=muted||hidden ? 0 : inLocker ? .005 : inTunnel ? .016 : .085;
   ambience.gain.setTargetAtTime(volume,audio.currentTime,.25);
   ambience.filter.frequency.setTargetAtTime(inLocker ? 185 : inTunnel ? 275 : 480,audio.currentTime,.3);
 }
 function startAmbience(){
   if(!audioContext)return;
   audio??=new audioContext();
   audio.resume().catch(()=>{});
   if(ambience)return;
   const size=audio.sampleRate*3;
   const buffer=audio.createBuffer(1,size,audio.sampleRate);
   const samples=buffer.getChannelData(0);
   let low=0;
   for(let i=0;i<size;i++){
     low=.94*low+.06*(Math.random()*2-1);
     samples[i]=low;
   }
   const signal=audio.createBufferSource();
   signal.buffer=buffer;
   signal.loop=true;
   const filter=audio.createBiquadFilter();
   filter.type='lowpass';
   const gain=audio.createGain();
   gain.gain.value=0;
   signal.connect(filter).connect(gain).connect(audio.destination);
   signal.start();
   ambience={gain:gain.gain,filter};
   updateAmbience();
 }
 const key=new Set(),stick=new THREE.Vector2();const clearInput=()=>{key.clear();resetStick()};window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden)clearInput();updateAmbience()});
 window.addEventListener('keydown',e=>{if(paused||e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable]')||(['Enter','Space'].includes(e.code)&&e.target.closest?.('button,a')))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.code))e.preventDefault();key.add(e.code);if(!e.repeat&&(e.code==='Space'||e.code==='Enter'))action(e.code==='Enter')});window.addEventListener('keyup',e=>key.delete(e.code));
 const joystick=document.getElementById('joystick'),knob=joystick.querySelector('i');let pointer=null;joystick.addEventListener('pointerdown',e=>{pointer=e.pointerId;joystick.setPointerCapture(pointer);updateStick(e)});joystick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)updateStick(e)});function updateStick(e){const r=joystick.getBoundingClientRect();stick.set((e.clientX-r.left-r.width/2)/(r.width*.42),(e.clientY-r.top-r.height/2)/(r.height*.42));if(stick.length()>1)stick.normalize();knob.style.transform=`translate(${stick.x*r.width*.30}px,${stick.y*r.height*.30}px)`}function resetStick(){pointer=null;stick.set(0,0);knob.style.transform=''}joystick.addEventListener('pointerup',resetStick);joystick.addEventListener('pointercancel',resetStick);joystick.addEventListener('lostpointercapture',resetStick);
 function sound(){if(muted||!audioContext)return;audio??=new audioContext();audio.resume().catch(()=>{});[392,523.25,659.25,783.99].forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(0,audio.currentTime+i*.12);g.gain.linearRampToValueAtTime(.1,audio.currentTime+i*.12+.015);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+i*.12+.38);o.connect(g);g.connect(audio.destination);o.start(audio.currentTime+i*.12);o.stop(audio.currentTime+i*.12+.4)})}
 function touchdown(zone){if(celebration)return;celebration=zone;motion.set(0,0);zoneLock=zone;zoom=reducedMotion?0:1.8;player.celebrate();onTouchdown();score('TOUCHDOWN · '+zone.label,true);sound();confettiTime=2;confettiItems.forEach((p,i)=>{p.x=player.root.position.x;p.y=1;p.z=player.root.position.z;confettiVel[i].set((Math.random()-.5)*10,5+Math.random()*9,(Math.random()-.5)*10)});setTimeout(()=>{celebration=null;score(zone.label);if(!paused)onOpen(zone.kind)},reducedMotion?250:950)}
 const ballGeometry = new THREE.SphereGeometry(1, 24, 15);
 const lacesGeometry = new THREE.CapsuleGeometry(.009,.046,2,5);
 const axis = new THREE.Vector3(0,0,1);
 const tangent = new THREE.Vector3();
 function launch() {
   if(flight||celebration||returnBallIn>0)return;
   const passer=player.root.position;
   const span=passer.distanceTo(teammate.position);
   if(span>27){onStatus('Acércate al receptor #87 para pasar.');return;}
   player.root.rotation.y=Math.atan2(teammate.position.x-passer.x,teammate.position.z-passer.z);
   const ball=new THREE.Group();
   const leather=new THREE.Mesh(ballGeometry,material('#77472e'));
   leather.scale.set(.152,.152,.262);
   leather.castShadow=true;
   ball.add(leather);
   for(let i=-2;i<=2;i++){
     const lace=new THREE.Mesh(lacesGeometry,material('#fff6db'));
     lace.position.set(0,.15,i*.045);
     lace.rotation.z=Math.PI/2;
     ball.add(lace);
   }
   ball.visible=false;
   scene.add(ball);
   player.throw();
   flight={ball,from:new THREE.Vector3(),to:teammate.aim(passer).clone(),time:0,duration:THREE.MathUtils.clamp(span/20,.62,1.08),released:false};
 }

 function receiverNear(pos) {
   let shortest = 10;
   let result = null;
   for (const target of targets) {
     const distance = Math.hypot(pos.x-target.x, pos.z-target.z);
     if (distance < shortest) { shortest=distance; result=target; }
   }
   return result;
 }

 function action(enter=false) {
   if(paused||celebration||replay||flight||playerStun>0)return;
   if(inLocker){onOpen('contact');return;}
   if(inTunnel){assistedWalk=!assistedWalk;return;}
   if(!enter&&playMode&&(!current||current.portal)){if(teammateActive)launch();return;}
   if(current){
     if(current.portal && playMode)touchdown(current);
     else if(current.kind==='tunnel'){
       cameraYaw=Math.PI/2;
       assistedWalk=true;
     } else {zoneLock=current;onOpen(current.kind);}
     return;
   }
   const target=receiverNear(player.root.position);
   if(target && (enter||!playMode))cueProject(target.p);
   else if(!playMode)onOpen('all');
 }
 const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
 const clickTargets = new Map();
 for (const zone of zones) for (const mesh of zone.features || []) clickTargets.set(mesh, {zone});
 for (const target of targets) {
   clickTargets.set(target.marker, {target});
 }
 const clickMeshes = [...clickTargets.keys()];
 const intersections = [];
 function pick(event) {
   const rect=renderer.domElement.getBoundingClientRect();
   mouse.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
   ray.setFromCamera(mouse,camera);
   intersections.length = 0;
   if (inLocker) return ray.intersectObject(lockerSign,false,intersections).length ? {contact:true} : null;
   if (inTunnel) return null;
   ray.intersectObjects(clickMeshes, false, intersections);
   return clickTargets.get(intersections[0]?.object);
 }
 const canvas=renderer.domElement;
 let drag;
 canvas.addEventListener('pointerdown', event => {
   if (paused || replay || event.button !== 0 || drag) return;
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,distance:0};
   canvas.setPointerCapture(event.pointerId);
 });
 canvas.addEventListener('pointermove',event=>{
   if (paused) return;
   if (drag?.id===event.pointerId) {
     const x=event.clientX-drag.x, y=event.clientY-drag.y;
     drag.x=event.clientX;drag.y=event.clientY;
     drag.distance+=Math.hypot(x,y);
     if(drag.distance>6){
       cameraYaw-=x*.008;
       cameraPitch=THREE.MathUtils.clamp(cameraPitch+y*.006,.22,1.18);
       canvas.style.cursor='grabbing';
     }
     return;
   }
   canvas.style.cursor=pick(event)?'pointer':'grab';
 });
 canvas.addEventListener('pointercancel',()=>{drag=null;});
 canvas.addEventListener('lostpointercapture',()=>{drag=null;});
 canvas.addEventListener('pointerup',event=>{
   const didDrag=drag?.id===event.pointerId&&drag.distance>6;
   drag=null;
   canvas.style.cursor='grab';
   if(didDrag||paused||celebration||replay)return;
   const hit=pick(event);
   if(hit?.contact){onOpen('contact');return;}
   if(hit?.zone){
     if(hit.zone.kind==='tunnel')guideToTunnel();
     else onOpen(hit.zone.kind);
     return;
   }
   if(!hit?.target)return;
   const target=hit.target;
   cueProject(target.p);
 });
 function resize(){
   ({width,height}=viewport());
   camera.aspect=width/height;
   camera.fov=camera.aspect<.85?55:46;
   camera.updateProjectionMatrix();
   renderer.setSize(width,height,false);
 }window.addEventListener('resize',resize);
 resize();
 const zero=new THREE.Vector2(),direction=new THREE.Vector2(),cameraOffset=new THREE.Vector3(),desired=new THREE.Vector3(),lookAt=new THREE.Vector3(),lookTarget=new THREE.Vector3();
 const cameraAnchor=new THREE.Vector3(), followPoint=new THREE.Vector3(), lead=new THREE.Vector3();
 const projection=new THREE.Vector3(), worldTag=new THREE.Vector3();
 const destinations=targets.map(target=>({repo:target.p.repo,x:0,y:0,visible:false}));
 let tunnelBlend=0, destinationTimer=0, teammateActive=false;
 function publishDestinations(dt, hide) {
   destinationTimer-=dt;
   if(destinationTimer>0)return;
   destinationTimer=.04;
   for(const [i,target] of targets.entries()){
     worldTag.set(target.x,.48,target.z);
     projection.copy(worldTag).project(camera);
     const marker=destinations[i];
     marker.x=(projection.x*.5+.5)*width;
     marker.y=(.5-projection.y*.5)*height;
     marker.visible=!hide&&projection.z<1&&projection.z>-1
       &&marker.x>58&&marker.x<width-58&&marker.y>100&&marker.y<height-(compact?155:90)
       &&camera.position.distanceToSquared(worldTag)<5600
       &&!collision.occluded(camera.position,worldTag);
   }
   const visible=destinations.filter(marker=>marker.visible).sort((a,b)=>b.y-a.y);
   for(const [index, marker] of visible.entries()){
     if(visible.slice(0,index).some(other=>other.visible&&Math.abs(marker.x-other.x)<132&&Math.abs(marker.y-other.y)<39))marker.visible=false;
   }
   onDestinations(destinations);
 }
 let prev=performance.now();
 function frame(now){
 requestAnimationFrame(frame);
 const realDelta=Math.max(0,(now-prev)/1000);
 const dt=THREE.MathUtils.clamp(realDelta,0,.05);
 prev=now;
 if(hidden||paused)return;
 measureQuality(realDelta);
 elapsed+=dt;
 const pos=player.root.position;
 playerStun=Math.max(0,playerStun-dt);
 if(returnBallIn>0){
   returnBallIn=Math.max(0,returnBallIn-dt);
   if(returnBallIn===0)player.recoverBall();
 }
 let moving=0;
 const sprint=(key.has('ShiftLeft')||key.has('ShiftRight'))&&!inTunnel&&!inLocker;
 if(!celebration&&!replay&&!playerStun){
   const dx=(key.has('KeyD')||key.has('ArrowRight')?1:0)-(key.has('KeyA')||key.has('ArrowLeft')?1:0)+stick.x;
   const dz=(key.has('KeyS')||key.has('ArrowDown')?1:0)-(key.has('KeyW')||key.has('ArrowUp')?1:0)+stick.y;
   const dir=direction.set(dx,dz);
   if(dir.lengthSq()>.025)assistedWalk=false;
   if(dir.length()>1)dir.normalize();
   dir.rotateAround(zero,-(mapOpen?0:inTunnel||inLocker?Math.PI/2:cameraYaw));
   if(assistedWalk){
     dir.set((-55-pos.x)*.65,(tunnelZ-pos.z)*1.6).normalize();
     if(pos.x<-54.8){
       assistedWalk=false;
       dir.set(0,0);
     }
   }
   motion.lerp(dir.multiplyScalar(sprint?13:inLocker||inTunnel||assistedWalk?4.7:7.35),1-Math.exp(-12*dt));
   if(motion.length()>.13){
     movePlayer(pos,dt);
     const angle=Math.atan2(motion.x,motion.y);
     if(!flight||flight.released)player.root.rotation.y+=Math.atan2(Math.sin(angle-player.root.rotation.y),Math.cos(angle-player.root.rotation.y))*(1-Math.exp(-13*dt));
     moving=motion.length()>.32;
   }
 }
 const enteredLocker=pos.x<tunnelEnd;
 const enteredTunnel=!enteredLocker&&insideTunnel(pos);
 const ambienceChanged=enteredLocker!==inLocker||enteredTunnel!==inTunnel;
 if(enteredLocker!==inLocker)onRoom(enteredLocker);
 if(enteredTunnel&&!inTunnel&&!inLocker)mapOpen=false;
 inLocker=enteredLocker;
 inTunnel=enteredTunnel;
 if(ambienceChanged)updateAmbience();
 const showTeammate=playMode&&!inLocker&&!inTunnel;
 if(teammateActive!==showTeammate){
   teammateActive=showTeammate;
   teammate.activate(showTeammate,pos);
 }
 teammate.update(dt,pos,Boolean(flight),elapsed);
 const warning=defense.update(dt,pos,motion,playMode&&!replay&&!inLocker&&!inTunnel&&Math.abs(pos.x)<26&&Math.abs(pos.z)<43,reducedMotion);
 if(warning&&!defenderWarning&&!playerStun)onStatus('¡Defensor cerca! Cambia de dirección o acelera.');
 defenderWarning=warning;
 current=inTunnel||inLocker?null:zones.find(z=>Math.hypot(pos.x-z.x,pos.z-z.z)<(z.portal?5:4));
 if(zoneLock&&Math.hypot(pos.x-zoneLock.x,pos.z-zoneLock.z)>7)zoneLock=null;
 const receiver=inTunnel||inLocker?null:receiverNear(pos);
 const interaction=current||receiver;
 nearMarker.visible=Boolean(interaction && current?.kind!=='tunnel');
 if(nearMarker.visible)nearMarker.position.set(interaction.x,.086,interaction.z);
 const actionText=inLocker?'Abrir contacto':inTunnel?assistedWalk?'Detener avance':'Avanzar al camarín':current?.portal?'Ver proyectos':current?.kind==='tunnel'?'Entrar al túnel':current?'Abrir panel':receiver?'Abrir ficha':playMode?'Pasar a #87':'Abrir proyectos';
 const label=inLocker?'Camarín':inTunnel?'Túnel':'';
 const zoneLabel=label||current?.label||receiver?.p.title||(playMode?'Jugada rápida':'Recorrido libre');
 const interactionKey=zoneLabel+':'+actionText;
 if(!replay&&interactionKey!==lastInteraction){
   const hint=inLocker?'Toca la pantalla de Contacto o pulsa Enter.':inTunnel?'Avanza por el pasillo iluminado.':current?.kind==='tunnel'?'Cruza a pie o activa el avance guiado.':receiver&&playMode?'Enter abre la ficha. Espacio pasa al #87.':interaction?'Pulsa Enter o toca el destino.':playMode?'Pasa al #87 y esquiva a los defensores.':'Toca una etiqueta o abre el catálogo.';
   onZone(zoneLabel,hint,actionText,showTeammate);
   score(zoneLabel);
   lastInteraction=interactionKey;
 }
 if(playMode&&!replay&&current?.portal&&current!==zoneLock&&!flight)touchdown(current);
 player.update(dt,moving,sprint);
 if(playerStun>0){
   const fall=Math.min(1,(.8-playerStun)*7,playerStun*4);
   player.model.rotation.x=-fall*1.27;
   player.model.position.y=-fall*.23;
 }
 if(player.external&&playerStun>0)player.external.rotation.x=player.model.rotation.x;
 else if(player.external)player.external.rotation.x=0;
 playerShadow.position.set(pos.x,.082,pos.z);
 playerShadow.material.opacity= .62-Math.min(player.model.position.y,.5)*.36;
 if(flight){
   flight.time+=dt;
   if(!flight.released&&flight.time>=.22) {
     player.releaseBall(flight.from);
     flight.to.copy(teammate.aim(pos));
     flight.ball.visible=true;
     flight.released=true;
   }
   if(flight.released){
     const t=Math.min(1,(flight.time-.22)/flight.duration);
     const arc=Math.min(3.8,flight.duration*3.3);
     flight.ball.position.lerpVectors(flight.from,flight.to,t);
     flight.ball.position.y+=4*t*(1-t)*arc;
     tangent.subVectors(flight.to,flight.from);
     tangent.y+=4*(1-2*t)*arc;
     flight.ball.quaternion.setFromUnitVectors(axis,tangent.normalize());
     flight.ball.rotateZ(t*26);
     if(t===1){
       scene.remove(flight.ball);
       teammate.catchBall();
       returnBallIn=.96;
       flight=null;
       onStatus('Pase completo · #87 recibió el balón.');
     }
   }
 }
 if(!inLocker&&confettiTime>0){confettiTime-=dt;confettiItems.forEach((p,i)=>{confettiVel[i].y-=12*dt;p.x+=confettiVel[i].x*dt;p.y+=confettiVel[i].y*dt;p.z+=confettiVel[i].z*dt;temp.position.set(p.x,p.y,p.z);temp.scale.set(1,1,1);temp.rotation.set(elapsed*i,0,elapsed*2);temp.updateMatrix();confetti.setMatrixAt(i,temp.matrix)});confetti.instanceMatrix.needsUpdate=true;confetti.visible=true}else confetti.visible=false;
 if(!inLocker&&snow.visible&&!paused){for(let i=0;i<snow.count;i++){const flake=snowflakes[i];flake.x+=.18*dt;flake.y-=2*dt;if(flake.y<0)flake.y=35;temp.position.set(flake.x,flake.y,flake.z);temp.scale.setScalar(i%5*.16+.6);temp.rotation.set(elapsed*.4,i,0);temp.updateMatrix();snow.setMatrixAt(i,temp.matrix)}snow.instanceMatrix.needsUpdate=true}
 zoom=Math.max(0,zoom-dt);
 const instant=reducedMotion||snapView;
 const blend=instant?1:1-Math.exp(-5.2*dt);
 const angle=cameraYaw-smoothedYaw;
 smoothedYaw+=Math.atan2(Math.sin(angle),Math.cos(angle))*blend;
 smoothedPitch=THREE.MathUtils.lerp(smoothedPitch,cameraPitch,blend);
 const radius=(camera.aspect<.85?20:17.8)*(zoom>0?.90:1);
 cameraOffset.set(Math.sin(smoothedYaw)*Math.cos(smoothedPitch)*radius,
   Math.sin(smoothedPitch)*radius+1.6,Math.cos(smoothedYaw)*Math.cos(smoothedPitch)*radius);
 tunnelBlend=instant?Number(inTunnel||inLocker):THREE.MathUtils.damp(tunnelBlend,inTunnel||inLocker?1:0,8,dt);
 if(replay){
   desired.copy(replayView);
   lookTarget.copy(replayLook);
 } else if(mapOpen){
   desired.set(Math.sin(cameraYaw-defaultYaw)*65,camera.aspect<.85?174:128,camera.aspect<.85?39:48);
   lookTarget.set(0,0,0);
 } else {
   followPoint.lerp(pos,instant?1:1-Math.exp(-8*dt));
   desired.copy(followPoint).add(cameraOffset);
   lead.set(motion.x*.26,0,motion.y*.26);
   lookTarget.set(followPoint.x-2.2*Math.sin(smoothedYaw),1.52,followPoint.z-2.2*Math.cos(smoothedYaw)).add(lead);
   if(tunnelBlend>.002){
     desired.lerp(cameraOffset.set(pos.x+(inLocker?6.9:6.35),2.64,THREE.MathUtils.clamp(pos.z*.55+tunnelZ*.45,tunnelZ-2.8,tunnelZ+2.8)),tunnelBlend);
     lookTarget.lerp(cameraOffset.set(pos.x-4.8,1.68,THREE.MathUtils.clamp(pos.z,tunnelZ-2.65,tunnelZ+2.65)),tunnelBlend);
   }
 }
 if(mapOpen||replay)camera.position.lerp(desired,blend);
 else{
   cameraAnchor.set(pos.x,1.58,pos.z);
   collision.apply(cameraAnchor,desired,dt,instant);
   camera.position.copy(desired);
 }
 snapView=false;
 lookAt.lerp(lookTarget,blend);
 camera.lookAt(lookAt);
 camera.updateMatrixWorld();
 publishDestinations(dt,mapOpen||Boolean(replay)||inTunnel||inLocker);
 renderer.render(scene,camera);
 if(replay){
   replay.remaining-=dt;
   if(replay.remaining<=0){
     const selected=replay.project;
     replay=null;
     onProject(selected);
   }
 }
 }
 applyDetail(detail);
 requestAnimationFrame(frame);
 const initialSnow=document.getElementById('snow');initialSnow.setAttribute('aria-pressed',snow.visible);initialSnow.textContent='Nieve: '+(snow.visible?'sí':'no');
 return {
   backend,action,setQuality,guideToTunnel,leaveLocker,
   get inLocker(){return inLocker;},
   pass(){if(playMode&&teammateActive&&!paused&&!replay&&!playerStun)launch();},
   openDestination(repo){const target=targets.find(item=>item.p.repo===repo);if(target&&!paused)cueProject(target.p);},
   togglePlayMode(){stopMovement();playMode=!playMode;lastInteraction='';return playMode;},
   centerCamera(){cameraYaw=inTunnel||inLocker?Math.PI/2:defaultYaw;cameraPitch=defaultPitch;},
   toggleMap(){if(inTunnel||inLocker)return false;mapOpen=!mapOpen;collision.reset();if(!mapOpen)snapView=true;return mapOpen;},
   pause(value){paused=value;clearInput();motion.set(0,0);drag=null;if(value)replay=null;},
   toggleSnow(){snowEnabled=!snowEnabled;syncSnow();return snowEnabled;},
   toggleSound(){
     muted=!muted;
     if(!muted)startAmbience();
     updateAmbience();
     return !muted;
   },
 };
}
