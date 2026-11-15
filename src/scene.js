import * as THREE from 'three';
import {PlayerAvatar} from './avatar.js';
import {createDefense} from './defense.js';
import {featuredProjects} from './featured.js';
import {createReceiver} from './receiver.js';
import {createCameraCollision} from './follow-camera.js';
import {endZone, fieldHalfWidth, goalLine, isGoodKick, pointsByPlay, posts} from './football.js';
import { addAtmosphere, addGrandstands, addLockerRoom, addTunnel, contactShadow, createRenderer, turfMaterial } from './stadium.js';
const GREEN='#203731',GOLD='#FFB612';
const tunnelZ=-1, tunnelMouth=-32.25, tunnelEnd=-47.62, lockerX=-54.45;
const insideTunnel = pos => pos.x<tunnelMouth && Math.abs(pos.z-tunnelZ)<3.4;
export async function createGame({container,projects,onOpen,onProject,onZone,onTouchdown,onFailure,onStatus=()=>{},onRoom=()=>{},onQuality=()=>{},onDestinations=()=>{},onPlay=()=>{},onKickAim=()=>{},onDeadPlay=()=>{}}){
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
 const lockerSign=sign('CONTACTO  /  RICARDO HAGUER',0,2.49,-6.44,5.42,2.12,'#f4f8ed');
 locker.add(lockerSign);
 const playerShadow = contactShadow(scene);
 for (const z of [-59,59]) {
   const shadow = contactShadow(scene);
   shadow.position.set(0,.073,z);
   shadow.scale.set(1.66,.71,1);
 }
 let player=new PlayerAvatar();
 player.number='12';
 player.root.name='Jugador 12';
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
 const postPaint=new THREE.MeshStandardMaterial({color:'#ffca30',emissive:'#e39200',emissiveIntensity:.7,roughness:.48});
 for(const end of [-1,1]){
   const z=end*posts.z;
   const frame=new THREE.Group();
   frame.name=end<0?'Poste norte':'Poste sur';
   scene.add(frame);
   const pad=cylinder(.5,1.65,'#203731',0,.825,z,frame);
   pad.name='Protección del poste';
   cylinder(.28,posts.crossbar,'#dca625',0,posts.crossbar/2,z,frame).material=postPaint;
   const crossbar=cylinder(posts.radius,posts.halfWidth*2,'#ffca30',0,posts.crossbar,z,frame);
   crossbar.material=postPaint;
   crossbar.rotation.z=Math.PI/2;
   for(const x of [-posts.halfWidth,posts.halfWidth]){
     const pole=cylinder(posts.radius,8.6,'#ffca30',x,posts.crossbar+4.3,z,frame);
     pole.material=postPaint;
   }
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
 let points=0, scoringMode=false, recentLabel='';
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
   ctx.fillText('BIENESTAR LIM CHILE',768,344,1300);
   ctx.fillStyle=flash?GREEN:GOLD;
   ctx.fillRect(578,393,380,10);
   ctx.font='700 34px Arial';
   ctx.fillText(label.toUpperCase(),768,492,1300);
   ctx.fillStyle=flash?GREEN:'#c3d8c9';
   ctx.font='600 29px Arial';
   if(scoringMode) {
     ctx.font='800 53px Arial';
     ctx.fillText('MARCADOR    '+String(points).padStart(2,'0')+' PTS',768,575);
   } else ctx.fillText(projects.length+' PROYECTOS · '+new Set(projects.map(p=>p.category)).size+' ÁREAS',768,559);
   scoreboardTexture.needsUpdate=true;
 }
 score('Recorrido libre');
 const targets=featuredProjects(projects);
 let routeTarget=null;
 for(const [index, target] of targets.entries()){
   target.marker=groundText(String(index+1),target.x,target.z,3.6,2.7,'#edf8e9');
   if(index===0)continue;
   const side=Math.sign(target.x);
   const wallX=side*32.91;
   box(.40,1.85,12.8,'#0e2931',wallX,1.83,target.z);
   box(.44,.12,12.85,'#e4b14c',wallX,.91,target.z);
   const display=sign(target.sign,wallX-side*.24,1.88,target.z,12.4,1.65,'#fcdf92');
   display.rotation.y=-side*Math.PI/2;
   target.display=display;
   if(index===1){
     box(1.06,.65,2.15,'#283f3e',-30.3,.34,target.z-2.8);
     box(1.33,.13,2.15,'#9caeb1',-30.3,.73,target.z-2.8);
     box(.09,.32,.63,'#1e383a',-30.38,.92,target.z-2.8);
   } else {
     const upper=sign('SEÑALES · DATOS DE EJEMPLO',wallX-side*.25,3.29,target.z,9,.83,'#c0e6da');
     upper.rotation.y=-side*Math.PI/2;
     const signal=document.createElement('canvas');
     signal.width=512;signal.height=96;
     const chart=signal.getContext('2d');
     chart.fillStyle='#102923';chart.fillRect(0,0,512,96);
     chart.strokeStyle='#75e7b5';chart.lineWidth=2;
     chart.beginPath();
     for(let x=0;x<512;x+=2){
       const y=48-Math.sin(x/12)*3-Math.sin(x/3.2)*2-29*Math.exp(-Math.pow((x%97-42)/4,2));
       if(x===0)chart.moveTo(x,y);
       else chart.lineTo(x,y);
     }
     chart.stroke();
     const texture=new THREE.CanvasTexture(signal);
     texture.colorSpace=THREE.SRGBColorSpace;
     const monitor=new THREE.Mesh(new THREE.PlaneGeometry(9,.96),new THREE.MeshBasicMaterial({map:texture}));
     monitor.rotation.y=-side*Math.PI/2;
     monitor.position.set(wallX-side*.27,2.82,target.z);
     scene.add(monitor);
   }
 }
 const upVector=new THREE.Vector3(0,1,0), routeDirection=new THREE.Vector3();
 const trail=new THREE.Mesh(new THREE.ConeGeometry(.24,.75,3), new THREE.MeshBasicMaterial({color:'#ffce67'}));
 trail.visible=false;
 scene.add(trail);
 const rosterMarker=new THREE.Mesh(new THREE.RingGeometry(.74,.86,32),
   new THREE.MeshBasicMaterial({color:'#ffce67',side:THREE.DoubleSide}));
 rosterMarker.rotation.x=-Math.PI/2;
 rosterMarker.visible=false;
 scene.add(rosterMarker);
 const downMarker=new THREE.Mesh(new THREE.RingGeometry(.83,1.02,32),
   new THREE.MeshBasicMaterial({color:'#fff2bf',side:THREE.DoubleSide}));
 downMarker.rotation.x=-Math.PI/2;
 downMarker.visible=false;
 scene.add(downMarker);
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
 let replay=null, ambience=null, assistedWalk=false;
 let pendingTry=0, conversionEnd=0, kickAim=null, caughtInEnd=0;
 const previousPosition=player.root.position.clone();
 const stoppedAt=new THREE.Vector3();
 let deadPlay=null, cameraWide=false, nextKickEnd=0;

 const replayView=new THREE.Vector3(0,12,-41), replayLook=new THREE.Vector3(0,12.7,-69);
 const defense=createDefense(scene,()=>{
   playerStun=.8;
   motion.set(0,0);
   if(flight&&!flight.released){
     scene.remove(flight.ball);
     player.recoverBall();
     player.throwTime=0;
     player.kickTime=0;
     flight=null;
   }
   if(conversionEnd){
     conversionEnd=0;
     publishPlay();
     onStatus('Conversión detenida · 0 puntos.');
   }
   stoppedAt.copy(player.root.position);
   downMarker.position.set(stoppedAt.x,.08,stoppedAt.z);
   downMarker.visible=true;
   deadPlay={label:'Tackle · jugada detenida',kind:null};
   onDeadPlay(deadPlay);
   onStatus('La siguiente jugada comienza en este punto.');

 });
 function publishPlay(){
   onPlay({active:playMode&&!inTunnel&&!inLocker,points,number:player.number,receiver:teammate.number,
     extra:Boolean(pendingTry),conversion:Boolean(conversionEnd)});
 }
 function cancelKick(){
   if(!kickAim)return;
   kickAim=null;
   onKickAim(null);
   publishPlay();
 }
 function stopMovement() {
   assistedWalk=false;
   clearInput();
   motion.set(0,0);
   playerStun=0;
   cancelKick();
   if(flight){scene.remove(flight.ball);flight=null;player.recoverBall();player.throwTime=0;player.kickTime=0;}
 }
 function nextPlay(){
   if(!deadPlay||paused)return;
   deadPlay=null;
   downMarker.visible=false;
   if(pendingTry)pendingTry=0;
   stopMovement();
   defense.reset();
   publishPlay();
   onDeadPlay(null);
 }
 function useProjects(){
   if(deadPlay?.kind)onOpen(deadPlay.kind);
 }
 function guideToProject(repo){
   const target=targets.find(item=>item.p.repo===repo);
   if(!target)return;
   routeTarget=target;
   if(inLocker||inTunnel)leaveLocker();
   if(mapOpen){mapOpen=false;collision.reset();snapView=true;}
   onStatus('Sigue la flecha dorada a '+target.name+'.');
 }
 function cueProject(project) {
   if(reducedMotion||inTunnel||inLocker||deadPlay){onProject(project);return;}
   if(replay)return;
   stopMovement();
   routeTarget=null;
   replay={project,remaining:.58};
   score(project.title);
 }
 function guideToTunnel() {
   if(inTunnel||inLocker)return;
   stopMovement();
   if(deadPlay)nextPlay();
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
 window.addEventListener('keydown',e=>{if(paused||e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable]')||(['Enter','Space'].includes(e.code)&&e.target.closest?.('button,a')))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','KeyK'].includes(e.code))e.preventDefault();key.add(e.code);if(!e.repeat&&e.code==='KeyK')kick();if(!e.repeat&&e.code==='KeyQ'&&!flight&&!deadPlay&&playMode){teammate.cycle();lastInteraction='';publishPlay();}if(!e.repeat&&(e.code==='Space'||e.code==='Enter'))action(e.code==='Enter')});window.addEventListener('keyup',e=>key.delete(e.code));
 const joystick=document.getElementById('joystick'),knob=joystick.querySelector('i');let pointer=null;joystick.addEventListener('pointerdown',e=>{pointer=e.pointerId;joystick.setPointerCapture(pointer);updateStick(e)});joystick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)updateStick(e)});function updateStick(e){const r=joystick.getBoundingClientRect();stick.set((e.clientX-r.left-r.width/2)/(r.width*.42),(e.clientY-r.top-r.height/2)/(r.height*.42));if(stick.length()>1)stick.normalize();knob.style.transform=`translate(${stick.x*r.width*.30}px,${stick.y*r.height*.30}px)`}function resetStick(){pointer=null;stick.set(0,0);knob.style.transform=''}joystick.addEventListener('pointerup',resetStick);joystick.addEventListener('pointercancel',resetStick);joystick.addEventListener('lostpointercapture',resetStick);
 function sound(){if(muted||!audioContext)return;audio??=new audioContext();audio.resume().catch(()=>{});[392,523.25,659.25,783.99].forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(0,audio.currentTime+i*.12);g.gain.linearRampToValueAtTime(.1,audio.currentTime+i*.12+.015);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+i*.12+.38);o.connect(g);g.connect(audio.destination);o.start(audio.currentTime+i*.12);o.stop(audio.currentTime+i*.12+.4)})}
 function addScore(type, label){
   const value=pointsByPlay[type];
   points+=value;
   publishPlay();
   score(label+' · +'+value,true);
   sound();
   onTouchdown(label+' +'+value);
 }
 function touchdown(end){
   const isConversion=conversionEnd===end;
   conversionEnd=0;
   pendingTry=isConversion?0:end;
   const zone=zones.find(z=>z.portal&&Math.sign(z.z)===end&&Math.sign(z.x)===(player.root.position.x<0?-1:1));
   celebration={remaining:reducedMotion?.25:.94,kind:isConversion?null:zone.kind,label:isConversion?'Conversión completada':'Touchdown anotado'};
   motion.set(0,0);
   zoom=reducedMotion?0:1.8;
   player.celebrate();
   addScore(isConversion?'conversion':'touchdown',isConversion?'CONVERSIÓN':'TOUCHDOWN');
   if(!reducedMotion){
     confettiTime=2;
     confettiItems.forEach((p,i)=>{p.x=player.root.position.x;p.y=1;p.z=player.root.position.z;confettiVel[i].set((Math.random()-.5)*10,5+Math.random()*9,(Math.random()-.5)*10)});
   }
 }
 function tryForTwo(){
   if(!playMode||!pendingTry||paused||flight||celebration||inTunnel||inLocker)return;
   stopMovement();
   deadPlay=null;
   onDeadPlay(null);
   conversionEnd=pendingTry;
   pendingTry=0;
   player.root.position.set(0,0,conversionEnd*(goalLine-1.92));
   previousPosition.copy(player.root.position);
   player.root.rotation.y=conversionEnd<0?Math.PI:0;
   cameraYaw=conversionEnd<0?0:Math.PI;
   teammate.activate(true,player.root.position,conversionEnd);
   publishPlay();
   snapView=true;
   onStatus('Conversión de 2 puntos · cruza la línea con el balón.');
 }
 function kick(){
   if(!playMode||paused||replay||flight||playerStun||celebration||inTunnel||inLocker||(deadPlay&&!pendingTry))return;
   if(conversionEnd){onStatus('Completa la conversión de 2 puntos cruzando la línea.');return;}
   const pos=player.root.position;
   if(!kickAim){
     const end=pendingTry||(pos.z>0?1:-1);
     if(!pendingTry&&(Math.abs(pos.x)>fieldHalfWidth||Math.abs(pos.z)<17||Math.abs(pos.z)>=goalLine)){
       onStatus('Para patear, acércate al poste sin cruzar la línea de gol.');
       return;
     }
     motion.set(0,0);
     kickAim={end,phase:0,extra:Boolean(pendingTry)};
     if(pendingTry){
       deadPlay=null;
       onDeadPlay(null);
       pos.set(0,0,end*(goalLine-14.4));
       teammate.activate(true,pos);
     }
     player.root.rotation.y=Math.atan2(-pos.x,end*posts.z-pos.z);
     cameraYaw=player.root.rotation.y+Math.PI;
     cameraPitch=.38;
     snapView=Boolean(pendingTry);
     onKickAim(0);
     return;
   }
   const {end,phase,extra}=kickAim;
   nextKickEnd=end;
   const distance=Math.abs(end*posts.z-pos.z);
   const miss=Math.sin(phase)*(3.7+distance*.033);
   const from=new THREE.Vector3(pos.x,.28,pos.z);
   const arc=2.3+distance*.07;
   const goalHeight=4.15+Math.max(0,34-distance)*.065-Math.abs(miss)*.17;
   const goalFraction=.88;
   const to=new THREE.Vector3(from.x+(miss-from.x)/goalFraction,
     from.y+(goalHeight-from.y-4*goalFraction*(1-goalFraction)*arc)/goalFraction,
     from.z+(end*posts.z-from.z)/goalFraction);
   pendingTry=0;
   cancelKick();
   publishPlay();
   player.kick();
   flight={type:'kick',ball:makeBall(),from,to,time:0,releaseAt:.18,duration:distance/38+.40,
     arc,goalFraction,goalX:miss,goalHeight,extra,released:false};
 }
 const ballGeometry = new THREE.SphereGeometry(1, 24, 15);
 const lacesGeometry = new THREE.CapsuleGeometry(.009,.046,2,5);
 const axis = new THREE.Vector3(0,0,1);
 const tangent = new THREE.Vector3();
 function makeBall(){
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
   return ball;
 }
 function launch() {
   if(flight||celebration||kickAim||deadPlay||pendingTry)return;
   const passer=player.root.position;
   const span=passer.distanceTo(teammate.position);
   if(span>27){onStatus('Acércate a tu compañero para pasar.');return;}
   player.root.rotation.y=Math.atan2(teammate.position.x-passer.x,teammate.position.z-passer.z);
   player.throw();
   const duration=THREE.MathUtils.clamp(span/20,.62,1.08);
   flight={type:'pass',ball:makeBall(),from:new THREE.Vector3(),to:teammate.aim(passer).clone(),
     time:0,releaseAt:.22,duration,arc:Math.min(3.8,duration*3.3),released:false};
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
   if(paused||celebration||replay||flight||playerStun>0||deadPlay)return;
   if(inLocker){onOpen('contact');return;}
   if(inTunnel){assistedWalk=!assistedWalk;return;}
   if(!enter&&playMode&&(!current||current.portal)){if(teammateActive)launch();return;}
   if(current){
     if(current.kind==='tunnel'){
       cameraYaw=Math.PI/2;
       assistedWalk=true;
     } else {zoneLock=current;onOpen(current.kind);}
     return;
   }
   const target=receiverNear(player.root.position);
   if(target && (enter||!playMode))cueProject(target.p);
   else onOpen('all');
 }
 const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
 const clickTargets = new Map();
 for (const zone of zones) for (const mesh of zone.features || []) clickTargets.set(mesh, {zone});
 for (const target of targets) {
   clickTargets.set(target.marker, {target});
 }
 clickTargets.set(board,{target:targets.find(item=>item.repo==='limchile-whatsapp-intuitivo')});
 for(const target of targets){if(target.display)clickTargets.set(target.display,{target});}
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
 if(celebration){
   celebration.remaining-=dt;
   if(celebration.remaining<=0){
     const {kind,label}=celebration;
     celebration=null;
     deadPlay={label,kind};
     onDeadPlay(deadPlay);
   }
 }
 if(kickAim){
   kickAim.phase+=dt*3.1;
   onKickAim(Math.sin(kickAim.phase));
 }
 let moving=0;
 const sprint=(key.has('ShiftLeft')||key.has('ShiftRight'))&&!inTunnel&&!inLocker;
 if(!celebration&&!replay&&!playerStun&&!deadPlay&&!kickAim&&flight?.type!=='kick'){
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
 if(ambienceChanged){updateAmbience();publishPlay();}
 const showTeammate=playMode&&!inLocker&&!inTunnel;
 if(teammateActive!==showTeammate){
   teammateActive=showTeammate;
   teammate.activate(showTeammate,pos);
 }
 teammate.update(dt,pos,flight?.type==='pass',elapsed,conversionEnd);
 const warning=defense.update(dt,pos,motion,playMode&&!replay&&!celebration&&!deadPlay&&!kickAim&&!flight?.released&&flight?.type!=='kick'&&!inLocker&&!inTunnel&&Math.abs(pos.x)<26&&Math.abs(pos.z)<(conversionEnd?48:43),reducedMotion,showTeammate);
 if(showTeammate&&!flight){
   const players=[player.root,...teammate.roots,...defense.roots];
   for(let i=1;i<players.length;i++){
     const current=players[i].position;
     for(let j=0;j<i;j++){
       const other=players[j].position;
       const dx=current.x-other.x, dz=current.z-other.z;
       const distance=Math.hypot(dx,dz);
       if(distance>=.7)continue;
       const correction=(.7-distance)*.73;
       current.x=THREE.MathUtils.clamp(current.x+(distance>.001?dx/distance:1)*correction,-26.5,26.5);
       current.z=THREE.MathUtils.clamp(current.z+(distance>.001?dz/distance:0)*correction,-55,55);
     }
   }
 }
 if(warning&&!defenderWarning&&!playerStun)onStatus('¡Defensor cerca! Cambia de dirección o acelera.');
 defenderWarning=warning;
 current=inTunnel||inLocker?null:zones.find(z=>Math.hypot(pos.x-z.x,pos.z-z.z)<(z.portal?5:4));
 if(zoneLock&&Math.hypot(pos.x-zoneLock.x,pos.z-zoneLock.z)>7)zoneLock=null;
 const receiver=inTunnel||inLocker?null:receiverNear(pos);
 const interaction=current||receiver;
 nearMarker.visible=Boolean(interaction && current?.kind!=='tunnel');
 if(nearMarker.visible)nearMarker.position.set(interaction.x,.086,interaction.z);
 const actionText=inLocker?'Abrir contacto':inTunnel?assistedWalk?'Detener avance':'Avanzar al camarín':current?.portal?'Ver proyectos':current?.kind==='tunnel'?'Entrar al túnel':current?'Abrir panel':receiver?'Abrir ficha':playMode?'Pasar al #'+teammate.number:'Abrir proyectos';
 const label=inLocker?'Camarín':inTunnel?'Túnel':'';
 const zoneLabel=label||current?.label||receiver?.p.title||(playMode?'Jugada rápida':'Recorrido libre');
 const interactionKey=zoneLabel+':'+actionText+':'+teammate.number;
 if(!replay&&interactionKey!==lastInteraction){
   const hint=inLocker?'Toca la pantalla de Contacto o pulsa Enter.':inTunnel?'Avanza por el pasillo iluminado.':current?.kind==='tunnel'?'Cruza a pie o activa el avance guiado.':receiver&&playMode?'Enter abre la ficha. Espacio pasa al #'+teammate.number+'.':interaction?'Pulsa Enter o toca el destino.':playMode?'Cruza la línea de gol con el balón. K permite patear.':'Toca una etiqueta o abre el catálogo.';
   onZone(zoneLabel,hint,actionText,showTeammate);
   if(!celebration&&!kickAim&&flight?.type!=='kick')score(pendingTry?'PUNTO EXTRA O CONVERSIÓN':zoneLabel);
   lastInteraction=interactionKey;
 }
 const end=endZone(pos);
 const crossed=end&&previousPosition.z*end<goalLine
   &&Math.abs(THREE.MathUtils.lerp(previousPosition.x,pos.x,(end*goalLine-previousPosition.z)/(pos.z-previousPosition.z)))<=fieldHalfWidth;
 if(playMode&&!deadPlay&&end&&(crossed||caughtInEnd===end)&&!replay&&!celebration&&!flight&&!playerStun&&!kickAim){
   if(conversionEnd===end||(!conversionEnd&&!pendingTry))touchdown(end);
 }
 caughtInEnd=0;
 previousPosition.copy(pos);
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
   const isKick=flight.type==='kick';
   if(!flight.released&&flight.time>=flight.releaseAt) {
     if(isKick) {
       player.ball.visible=false;
     } else {
       player.releaseBall(flight.from);
       flight.to.copy(teammate.aim(pos));
     }
     flight.ball.visible=true;
     flight.released=true;
   }
   if(flight.released){
     const t=Math.min(1,(flight.time-flight.releaseAt)/flight.duration);
     flight.ball.position.lerpVectors(flight.from,flight.to,t);
     flight.ball.position.y+=4*t*(1-t)*flight.arc;
     tangent.subVectors(flight.to,flight.from);
     tangent.y+=4*(1-2*t)*flight.arc;
     flight.ball.quaternion.setFromUnitVectors(axis,tangent.normalize());
     flight.ball.rotateZ(t*26);
     if(isKick&&!flight.resolved&&t>=flight.goalFraction){
       flight.resolved=true;
       if(isGoodKick(flight.goalX,flight.goalHeight)){
         addScore(flight.extra?'extraPoint':'fieldGoal',flight.extra?'PUNTO EXTRA':'GOL DE CAMPO');
       } else {
         const direction=flight.goalX*(nextKickEnd<0?1:-1)<0?'izquierda':'derecha';
         const reason=flight.goalHeight<posts.crossbar+posts.radius+.16
           ? 'Bajo el travesaño' : 'Desviada a la '+direction;
         score(reason);
         onTouchdown('PATADA FALLIDA');
         onStatus(reason+'.');
       }
     }
     if(t===1){
       scene.remove(flight.ball);
       flight=null;
       if(isKick)player.recoverBall();
       else {
         player=teammate.exchange(player);
         player.recoverBall();
         caughtInEnd=endZone(player.root.position);
         previousPosition.copy(player.root.position);
         playerStun=0;
         if(conversionEnd)cameraYaw=conversionEnd<0?0:Math.PI;
         motion.multiplyScalar(.78);
         defense.reset();
         publishPlay();
         onStatus('Pase completo · ahora controlas al #'+player.number+'.');
       }
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
 const radius=(cameraWide?28:camera.aspect<.85?20:17.8)*(zoom>0?.90:1);
 cameraOffset.set(Math.sin(smoothedYaw)*Math.cos(smoothedPitch)*radius,
   Math.sin(smoothedPitch)*radius+(cameraWide?6.2:1.6),Math.cos(smoothedYaw)*Math.cos(smoothedPitch)*radius);
 tunnelBlend=instant?Number(inTunnel||inLocker):THREE.MathUtils.damp(tunnelBlend,inTunnel||inLocker?1:0,8,dt);
 const kickView=kickAim?.end||(flight?.type==='kick'?nextKickEnd:0);
 if(kickView){
   const offset=THREE.MathUtils.clamp(Math.abs(kickView*posts.z-pos.z)*.23,8,14);
   desired.set(pos.x*.82,6.1,pos.z-kickView*offset);
   lookTarget.set(0,5.4,kickView*posts.z);
 } else if(replay){
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
 if((mapOpen||replay)&&!kickView)camera.position.lerp(desired,blend);
 else{
   cameraAnchor.set(pos.x,1.58,pos.z);
   collision.apply(cameraAnchor,desired,dt,instant);
   camera.position.copy(desired);
 }
 snapView=false;
 lookAt.lerp(lookTarget,blend);
 camera.lookAt(lookAt);
 camera.updateMatrixWorld();
 rosterMarker.visible=showTeammate&&!deadPlay&&!kickView;
 if(rosterMarker.visible)rosterMarker.position.set(teammate.position.x,.075,teammate.position.z);
 trail.visible=Boolean(routeTarget&&!inLocker&&!inTunnel&&!kickView);
 if(trail.visible){
   const dx=routeTarget.x-pos.x, dz=routeTarget.z-pos.z;
   const angle=Math.atan2(dx,dz);
   const range=Math.hypot(dx,dz);
   if(range<2.5){trail.visible=false;onStatus('Llegaste a '+routeTarget.name+'.');routeTarget=null;}
   else {
     trail.position.set(pos.x+Math.sin(angle)*3.5,.2,pos.z+Math.cos(angle)*3.5);
     trail.quaternion.setFromUnitVectors(upVector,routeDirection.set(dx,0,dz).normalize());
   }
 }
 publishDestinations(dt,mapOpen||Boolean(replay)||inTunnel||inLocker||Boolean(kickView)||Boolean(deadPlay));
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
   backend,action,kick,tryForTwo,nextPlay,useProjects,guideToProject,setQuality,guideToTunnel,leaveLocker,
   get inLocker(){return inLocker;},
   cycleReceiver(){if(!flight&&!deadPlay){teammate.cycle();lastInteraction='';publishPlay();}},
   toggleCamera(){cameraWide=!cameraWide;return cameraWide;},
   pass(){if(playMode&&teammateActive&&!paused&&!replay&&!playerStun)launch();},
   openDestination(repo){const target=targets.find(item=>item.p.repo===repo);if(target&&!paused)cueProject(target.p);},
   togglePlayMode(){stopMovement();deadPlay=null;downMarker.visible=false;onDeadPlay(null);defense.reset();playMode=!playMode;scoringMode=playMode;pendingTry=conversionEnd=caughtInEnd=0;previousPosition.copy(player.root.position);celebration=null;lastInteraction='';publishPlay();return playMode;},
   centerCamera(){cameraYaw=inTunnel||inLocker?Math.PI/2:defaultYaw;cameraPitch=defaultPitch;},
   toggleMap(){if(inTunnel||inLocker)return false;mapOpen=!mapOpen;collision.reset();if(!mapOpen)snapView=true;return mapOpen;},
   pause(value){paused=value;clearInput();motion.set(0,0);drag=null;if(value){replay=null;cancelKick();}},
   toggleSnow(){snowEnabled=!snowEnabled;syncSnow();return snowEnabled;},
   toggleSound(){
     muted=!muted;
     if(!muted)startAmbience();
     updateAmbience();
     return !muted;
   },
 };
}
