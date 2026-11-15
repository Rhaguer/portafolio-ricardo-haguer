import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PlayerAvatar} from './avatar.js';
import { addAtmosphere, addGrandstands, createRenderer, roundedArch, turfMaterial } from './stadium.js';
const GREEN='#203731',GOLD='#FFB612';
export async function createGame({container,projects,onOpen,onProject,onZone,onTouchdown,onFailure}){
 const scene = new THREE.Scene();
 const compact = matchMedia('(pointer: coarse)').matches;
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const {renderer, backend} = await createRenderer(() => document.createElement('canvas'), compact);
 renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.18 : 1.55));
 renderer.setSize(innerWidth, innerHeight);
 container.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.domElement.addEventListener('webglcontextlost', onFailure, {once:true});
 if (backend === 'WebGPU') {
   const deviceLost = renderer.onDeviceLost.bind(renderer);
   renderer.onDeviceLost = info => { deviceLost(info); onFailure(); };
 }
 const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 310);
 camera.position.set(-11, 12.5, 23);
 addAtmosphere(scene);
 scene.add(new THREE.HemisphereLight('#d5e5fa', '#58624d', 1.55));
 const sun = new THREE.DirectionalLight('#ffe3b2', 2.15);
 sun.position.set(-54, 40, -34);
 sun.castShadow = true;
 sun.shadow.mapSize.set(compact ? 768 : 1536, compact ? 768 : 1536);
 Object.assign(sun.shadow.camera, {left:-59,right:59,top:74,bottom:-74,near:1,far:174});
 sun.shadow.normalBias = .035;
 sun.shadow.bias = -.00025;
 scene.add(sun);
 const materials=new Map();function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.86}));return materials.get(color)}
 function box(w,h,d,color,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=h>.1;parent.add(m);return m}
 function cylinder(radius,height,color,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,12),material(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
 function textTexture(text,{bg=GREEN,color='#ffffff',width=1024,height=160,size=70}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);}ctx.fillStyle=color;ctx.font=`800 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,width/2,height/2,width-35);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
 function sign(text,x,y,z,w=10,h=1.5,color='#fff'){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(text,{color}),side:THREE.DoubleSide}));mesh.position.set(x,y,z);scene.add(mesh);return mesh}
 function groundText(text,x,z,w=10,h=4,color='#fff',bg=null){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(text,{color,bg}),side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,.065,z);scene.add(m);return m}
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
 const stripeMaterial = new THREE.MeshStandardMaterial({color:'#93ad70',transparent:true,opacity:.105,depthWrite:false});
 for(let i=0;i<10;i+=2){const strip=new THREE.Mesh(stripeGeometry,stripeMaterial);strip.rotation.x=-Math.PI/2;strip.position.set(0,.018,-43.2+i*9.6);strip.receiveShadow=true;scene.add(strip);}
 for(const x of [-27,27])box(.13,.04,116,'#ffffff',x,.05,0);
 for(let i=0;i<=10;i++){const z=-48+i*9.6;box(54,.05,.11,i===0||i===10?GOLD:'#ffffff',0,.05,z);if(i>0&&i<10){for(const x of [-21,21]){let m=groundText(String(i<=5?i*10:(10-i)*10),x,z+1.3,3.5,2,'#ffffff');if(x>0)m.rotation.z=Math.PI}}}

 for(const z of [-54,54]){box(54,.05,10,GREEN,0,.02,z);for(const x of [-27,27])box(.16,.06,11,GOLD,x,.05,z);box(54,.06,.18,GOLD,0,.05,z+Math.sign(z)*5);groundText(z<0?'HAGUER':'PORTFOLIO',0,z,30,5,GOLD)}
 const logo=new THREE.TextureLoader().load('./logo-rihm.webp');logo.colorSpace=THREE.SRGBColorSpace;const logoMesh=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshBasicMaterial({map:logo,transparent:true,depthWrite:false}));logoMesh.rotation.x=-Math.PI/2;logoMesh.position.y=.08;scene.add(logoMesh);
 // Instanced seating, spectators, and floodlights share geometry and materials.
 const temp=new THREE.Object3D();function instances(items,geometry,mat){const mesh=new THREE.InstancedMesh(geometry,mat,items.length);items.forEach((p,i)=>{temp.position.set(p.x,p.y,p.z);temp.scale.set(p.sx||1,p.sy||1,p.sz||1);temp.rotation.set(0,0,0);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);if(p.color)mesh.setColorAt(i,new THREE.Color(p.color))});mesh.receiveShadow=true;scene.add(mesh);return mesh}
 const hashes=[];for(let i=0;i<50;i++)for(const x of [-3,3,-26,26])hashes.push({x,y:.05,z:-47+i*1.92});
 instances(hashes,new THREE.BoxGeometry(.65,.04,.08),material('#ffffff'));
 addGrandstands(scene, compact);
 const lamps=[];for(const x of [-43,43])for(const z of [-64,64]){const flood=new THREE.SpotLight('#fff7d6',1900,72,.64,.65,2);flood.position.set(x,20,z);flood.target.position.set(x*.40,0,z*.42);scene.add(flood,flood.target);cylinder(.22,20,'#627568',x,10,z);for(let i=0;i<6;i++)lamps.push({x:x+(i%3-1)*.95,y:20+Math.floor(i/3)*.75,z,sx:.8,sy:.55,sz:.6});}instances(lamps,new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#fff8d3',emissive:'#fff1a0',emissiveIntensity:1}));
 // Tunnel and profile mat.
 box(12,6,8,'#354d3d',-38,2,-1);box(8,4.6,8.1,'#0a1813',-38,1.5,-1);box(10,.06,7,GOLD,-29,.1,-1);const tunnelSign=sign('PERFIL & EXPERIENCIA',-31,5,-1,11,1.3,GOLD);tunnelSign.rotation.y=Math.PI/2;
 const world=new CANNON.World({gravity:new CANNON.Vec3(0,-16,0)});world.broadphase=new CANNON.SAPBroadphase(world);world.allowSleep=true;const floor=new CANNON.Body({mass:0,shape:new CANNON.Plane()});floor.quaternion.setFromEuler(-Math.PI/2,0,0);world.addBody(floor);
 const player=new PlayerAvatar();player.root.position.set(-25,0,-1);player.root.rotation.y=Math.PI/2;scene.add(player.root);player.loadOptional();const playerBody=new CANNON.Body({mass:0,type:CANNON.Body.KINEMATIC,shape:new CANNON.Sphere(.8)});playerBody.position.set(-25,1,-1);world.addBody(playerBody);
 const zones=[{x:-22,z:-52,label:'Aplicaciones web',kind:'Desarrollo web',portal:true},{x:22,z:-52,label:'Automatización',kind:'Automatización',portal:true},{x:-22,z:52,label:'Datos e IoT',kind:'IoT y datos',portal:true},{x:22,z:52,label:'Móvil',kind:'Aplicaciones móviles',portal:true},{x:-29,z:-1,label:'Perfil & experiencia',kind:'profile'},{x:29,z:0,label:'Stack & metodología',kind:'skills'},{x:0,z:57,label:'Contacto & GitHub',kind:'contact'}];
 for (const zone of zones.filter(z => z.portal)) {
   const arch = roundedArch(zone.x, zone.z);
   const label = sign(zone.label.toUpperCase(), zone.x, 6.15, zone.z, 11.3, 1.2, GOLD);
   zone.features = [arch, label];
   scene.add(arch);
   groundText('TOUCHDOWN', zone.x, zone.z, 7, 1.5, GOLD);
 }
 const goalSensors=[];for(const z of [-59,59]){cylinder(.18,4,GOLD,0,2,z);const bar=cylinder(.15,11,GOLD,0,4,z);bar.rotation.z=Math.PI/2;for(const x of [-5.5,5.5])cylinder(.13,5,GOLD,x,6.5,z);const sensor=new CANNON.Body({mass:0,shape:new CANNON.Box(new CANNON.Vec3(5.5,4,1)),isTrigger:true});sensor.position.set(0,4,z);world.addBody(sensor);goalSensors.push(sensor);if(z>0)sensor.addEventListener('collide',event=>{if(event.body===playerBody&&!paused&&!flight&&zoneLock!==zones[6]){zoneLock=zones[6];onOpen('contact')}})}sign('CONTACTO & GITHUB',0,10,59,16,1.5,GOLD);
 let scoreboardTexture;const boardCanvas=document.createElement('canvas');boardCanvas.width=1536;boardCanvas.height=640;const boardCtx=boardCanvas.getContext('2d');scoreboardTexture=new THREE.CanvasTexture(boardCanvas);scoreboardTexture.colorSpace=THREE.SRGBColorSpace;
 box(33,11,1,GREEN,0,13,-69);const board=new THREE.Mesh(new THREE.PlaneGeometry(31,9.6),new THREE.MeshBasicMaterial({map:scoreboardTexture}));board.position.set(0,13,-68.4);scene.add(board);for(const x of [-13,13])cylinder(.4,10,GREEN,x,5,-69);
 function score(label,flash=false){boardCtx.fillStyle=flash?GOLD:'#10251d';boardCtx.fillRect(0,0,1536,640);boardCtx.strokeStyle=GOLD;boardCtx.lineWidth=10;boardCtx.strokeRect(12,12,1512,616);boardCtx.textAlign='center';boardCtx.fillStyle=flash?GREEN:GOLD;boardCtx.font='bold 64px Arial';boardCtx.fillText('RICARDO HAGUER',768,140);boardCtx.font='32px Arial';boardCtx.fillText('SOFTWARE & AUTOMATIZACIÓN',768,215);boardCtx.fillStyle=flash?GREEN:'#ffffff';boardCtx.font='bold 42px Arial';boardCtx.fillText(`${projects.length} REPOSITORIOS · 4 ÁREAS · INACAP`,768,345);boardCtx.font='40px Arial';boardCtx.fillText(label.toUpperCase(),768,485);boardCtx.font='24px Arial';boardCtx.fillText('DEL PROBLEMA A LA IMPLEMENTACIÓN',768,572);scoreboardTexture.needsUpdate=true}score('Bienvenido al campo');
 // Dynamic footballs and cheese wedges.
 const props=[];for(let i=0;i<12;i++){let cheese=i%2===0,mesh;if(cheese){const s=new THREE.Shape();s.moveTo(-.7,-.4);s.lineTo(.7,-.4);s.lineTo(0,.7);s.closePath();mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.45,bevelEnabled:false}),material(GOLD));mesh.geometry.rotateX(-Math.PI/2);mesh.geometry.center();}else{mesh=new THREE.Mesh(new THREE.SphereGeometry(.4,12,8),material('#6B3E26'));mesh.scale.z=1.65;const stitch=new THREE.Mesh(new THREE.BoxGeometry(.045,.05,.45),material('#ffffff'));stitch.position.y=.38;mesh.add(stitch)}mesh.castShadow=true;scene.add(mesh);const body=new CANNON.Body({mass:cheese?1:.6,shape:cheese?new CANNON.Box(new CANNON.Vec3(.65,.3,.6)):new CANNON.Sphere(.4),linearDamping:.35,angularDamping:.4});body.position.set(-15+(i%4)*10,1,-30+Math.floor(i/4)*25);world.addBody(body);props.push({mesh,body})}
 const dummyLabels=['Python & Django','JS / TypeScript','n8n & Integración','SQL & Power BI','.NET MAUI & Kotlin','Wazuh / SGSI / MITRE'];const dummies=dummyLabels.map((label,i)=>{const group=new THREE.Group();group.position.set(29,0,-25+i*10);scene.add(group);cylinder(.9,.3,GREEN,0,.15,0,group);cylinder(.55,2,GOLD,0,1.3,0,group);box(1.6,.35,.5,GREEN,0,2,0,group);const labelMesh=sign(label,30,3.6,-25+i*10,10,1.15,GOLD);labelMesh.rotation.y=-Math.PI/2;return {group,velocity:0,angle:0}});
 // Four representative projects, preserving the editorial featured choices.
 const featured=projects.filter(p=>p.featured);for(const p of projects)if(featured.length<4&&!featured.includes(p))featured.push(p);const targets=featured.slice(0,4).map((p,i)=>{const x=i%2?13:-13,z=[-28.8,-9.6,9.6,28.8][i];const ring=new THREE.Mesh(new THREE.RingGeometry(3.5,3.65,48),new THREE.MeshBasicMaterial({color:GOLD,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.08,z);scene.add(ring);const holo=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1.2,4,8),new THREE.MeshStandardMaterial({color:'#89f6cb',emissive:'#2c9671',transparent:true,opacity:.55,wireframe:true}));holo.position.set(x,1.6,z);scene.add(holo);const label=sign(`${i+1} · ${p.title}`,x,3.5,z,12,1.1,GOLD);return {x,z,p,holo,label,ring}});
 const snowCount=compact?180:320;
 const snowflakes=Array.from({length:snowCount},()=>({x:(Math.random()-.5)*90,y:Math.random()*35,z:(Math.random()-.5)*140}));
 const snow=instances(snowflakes,new THREE.OctahedronGeometry(.105),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.76,depthWrite:false}));
 snow.receiveShadow=false;snow.frustumCulled=false;snow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);snow.visible=!reducedMotion;
 const confettiItems=Array.from({length:90},(_,i)=>({x:0,y:-5,z:0,color:i%2?GOLD:GREEN}));const confetti=instances(confettiItems,new THREE.BoxGeometry(.14,.25,.08),material('#ffffff'));const confettiVel=confettiItems.map(()=>new THREE.Vector3());let confettiTime=0;
 confetti.frustumCulled=false;confetti.receiveShadow=false;confetti.visible=false;
 let muted=true,audio=null,paused=false,hidden=false,current=null,lastZone=null,zoneLock=null,flight=null,zoom=0,elapsed=0,celebration=null,mapOpen=false;
 const audioContext=window.AudioContext||window.webkitAudioContext;
 const key=new Set(),stick=new THREE.Vector2();const clearInput=()=>{key.clear();resetStick()};window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden)clearInput()});
 window.addEventListener('keydown',e=>{if(paused||e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable]')||(['Enter','Space'].includes(e.code)&&e.target.closest?.('button,a')))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.code))e.preventDefault();key.add(e.code);if(!e.repeat&&(e.code==='Space'||e.code==='Enter'))action(e.code==='Enter')});window.addEventListener('keyup',e=>key.delete(e.code));
 const joystick=document.getElementById('joystick'),knob=joystick.querySelector('i');let pointer=null;joystick.addEventListener('pointerdown',e=>{pointer=e.pointerId;joystick.setPointerCapture(pointer);updateStick(e)});joystick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)updateStick(e)});function updateStick(e){const r=joystick.getBoundingClientRect();stick.set((e.clientX-r.left-r.width/2)/45,(e.clientY-r.top-r.height/2)/45);if(stick.length()>1)stick.normalize();knob.style.transform=`translate(${stick.x*35}px,${stick.y*35}px)`}function resetStick(){pointer=null;stick.set(0,0);knob.style.transform=''}joystick.addEventListener('pointerup',resetStick);joystick.addEventListener('pointercancel',resetStick);joystick.addEventListener('lostpointercapture',resetStick);
 function sound(){if(muted||!audioContext)return;audio??=new audioContext();audio.resume().catch(()=>{});[392,523.25,659.25,783.99].forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(0,audio.currentTime+i*.12);g.gain.linearRampToValueAtTime(.1,audio.currentTime+i*.12+.015);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+i*.12+.38);o.connect(g);g.connect(audio.destination);o.start(audio.currentTime+i*.12);o.stop(audio.currentTime+i*.12+.4)})}
 function touchdown(zone){if(celebration)return;celebration=zone;zoneLock=zone;zoom=reducedMotion?0:1.8;player.celebrate();onTouchdown();score('TOUCHDOWN · '+zone.label,true);sound();confettiTime=2;confettiItems.forEach((p,i)=>{p.x=player.root.position.x;p.y=1;p.z=player.root.position.z;confettiVel[i].set((Math.random()-.5)*10,5+Math.random()*9,(Math.random()-.5)*10)});setTimeout(()=>{celebration=null;score(zone.label);if(!paused)onOpen(zone.kind)},reducedMotion?250:950)}
 function launch(target){if(flight||celebration)return;player.throw();const ball=new THREE.Mesh(new THREE.SphereGeometry(.23,12,8),material('#6B3E26'));ball.scale.z=1.7;scene.add(ball);const from=player.root.position.clone().add(new THREE.Vector3(0,1.7,0));const kick=!target&&current?.kind==='contact';const to=target?new THREE.Vector3(target.x,1.8,target.z):kick?new THREE.Vector3(0,4.5,62):from.clone().add(new THREE.Vector3(Math.sin(player.root.rotation.y)*15,-1.5,Math.cos(player.root.rotation.y)*15));flight={ball,from,to,time:0,target,kick}}
 function action(enter=false){if(paused||celebration)return;const target=targets.find(t=>Math.hypot(player.root.position.x-t.x,player.root.position.z-t.z)<10);if(target&&!enter){launch(target);return}if(current){if(current.portal)touchdown(current);else if(current.kind==='contact'&&!enter)launch(null);else{zoneLock=current;onOpen(current.kind)}}else if(!enter)launch(null)}
 const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
 const clickTargets = new Map();
 for (const zone of zones) for (const mesh of zone.features || []) clickTargets.set(mesh, {zone});
 for (const target of targets) {
   clickTargets.set(target.holo, {target});
   clickTargets.set(target.label, {target});
   clickTargets.set(target.ring, {target});
 }
 const clickMeshes = [...clickTargets.keys()];
 const intersections = [];
 function pick(event) {
   const rect=renderer.domElement.getBoundingClientRect();
   mouse.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
   ray.setFromCamera(mouse,camera);
   intersections.length = 0;
   ray.intersectObjects(clickMeshes, false, intersections);
   return clickTargets.get(intersections[0]?.object);
 }
 renderer.domElement.addEventListener('pointermove',event=>{
   renderer.domElement.style.cursor = !paused && pick(event) ? 'pointer' : '';
 });
 renderer.domElement.addEventListener('pointerup',event=>{
   if(paused||celebration)return;
   const hit=pick(event);
   if(hit?.zone){onOpen(hit.zone.kind);return;}
   if(!hit?.target)return;
   const target=hit.target;
   if(Math.hypot(player.root.position.x-target.x, player.root.position.z-target.z)<10)launch(target);
   else onProject(target.p);
 });
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}window.addEventListener('resize',resize);
 const direction=new THREE.Vector2(),cameraOffset=new THREE.Vector3(),desired=new THREE.Vector3(),lookAt=new THREE.Vector3(-25,1,-4),lookTarget=new THREE.Vector3();
 let prev=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-prev)/1000,.04);prev=now;if(hidden||paused)return;elapsed+=dt;const pos=player.root.position;let moving=0;const sprint=key.has('ShiftLeft')||key.has('ShiftRight');if(!paused&&!celebration){const dx=(key.has('KeyD')||key.has('ArrowRight')?1:0)-(key.has('KeyA')||key.has('ArrowLeft')?1:0)+stick.x;const dz=(key.has('KeyS')||key.has('ArrowDown')?1:0)-(key.has('KeyW')||key.has('ArrowUp')?1:0)+stick.y;const dir=direction.set(dx,dz);if(dir.length()>.05){if(dir.length()>1)dir.normalize();const speed=sprint?14:8;pos.x=THREE.MathUtils.clamp(pos.x+dir.x*speed*dt,-31,31);pos.z=THREE.MathUtils.clamp(pos.z+dir.y*speed*dt,-60,60);const angle=Math.atan2(dir.x,dir.y);player.root.rotation.y+=Math.atan2(Math.sin(angle-player.root.rotation.y),Math.cos(angle-player.root.rotation.y))*(1-Math.exp(-14*dt));moving=1}playerBody.velocity.set((pos.x-playerBody.position.x)/Math.max(dt,.001),0,(pos.z-playerBody.position.z)/Math.max(dt,.001));playerBody.position.set(pos.x,1,pos.z);world.step(1/60,dt,3);for(const p of props){p.mesh.position.copy(p.body.position);p.mesh.quaternion.copy(p.body.quaternion);if(Math.hypot(p.body.position.x-pos.x,p.body.position.z-pos.z)<1.5&&moving){p.body.wakeUp();if(p.body.velocity.length()<5)p.body.applyImpulse(new CANNON.Vec3(Math.sin(player.root.rotation.y)*2,.6,Math.cos(player.root.rotation.y)*2))}}for(const d of dummies){if(Math.hypot(pos.x-d.group.position.x,pos.z-d.group.position.z)<1.8&&moving)d.velocity+=dt*14;d.velocity+=(-18*d.angle-5*d.velocity)*dt;d.angle+=d.velocity*dt;d.group.rotation.z=-Math.min(d.angle,1.4)}current=zones.find(z=>Math.hypot(pos.x-z.x,pos.z-z.z)<(z.portal?4.3:5));if(zoneLock&&Math.hypot(pos.x-zoneLock.x,pos.z-zoneLock.z)>7)zoneLock=null;if(current!==lastZone){onZone(current?.label||'Centro del campo',current?'Enter: abrir · Espacio: pase / interactuar':'Acércate a una puerta o a un receptor');score(current?.label||'Explora los proyectos');lastZone=current}if(current?.portal&&current!==zoneLock&&!flight)touchdown(current);if(current?.kind==='profile'&&current!==zoneLock&&moving&&Math.hypot(pos.x-current.x,pos.z-current.z)<3){zoneLock=current;onOpen('profile')}if(current?.kind==='contact'&&current!==zoneLock&&pos.z>56&&!flight){zoneLock=current;onOpen('contact')}}
 player.update(dt,moving,sprint);if(flight&&!paused){flight.time+=dt;const t=Math.min(flight.time/1,1);flight.ball.position.lerpVectors(flight.from,flight.to,t);flight.ball.position.y+=4*t*(1-t)*5;flight.ball.rotation.y=Math.atan2(flight.to.x-flight.from.x,flight.to.z-flight.from.z);flight.ball.rotateZ(flight.time*24);if(t===1){const {target,kick}=flight;scene.remove(flight.ball);flight.ball.geometry.dispose();flight=null;if(target)onProject(target.p);else if(kick){zoneLock=zones[6];onOpen('contact')}}}
 if(confettiTime>0){confettiTime-=dt;confettiItems.forEach((p,i)=>{confettiVel[i].y-=12*dt;p.x+=confettiVel[i].x*dt;p.y+=confettiVel[i].y*dt;p.z+=confettiVel[i].z*dt;temp.position.set(p.x,p.y,p.z);temp.scale.set(1,1,1);temp.rotation.set(elapsed*i,0,elapsed*2);temp.updateMatrix();confetti.setMatrixAt(i,temp.matrix)});confetti.instanceMatrix.needsUpdate=true;confetti.visible=true}else confetti.visible=false;
 if(snow.visible&&!paused){snowflakes.forEach((flake,i)=>{flake.x+=.18*dt;flake.y-=2*dt;if(flake.y<0)flake.y=35;temp.position.set(flake.x,flake.y,flake.z);temp.scale.setScalar(i%5*.16+.6);temp.rotation.set(elapsed*.4,i,0);temp.updateMatrix();snow.setMatrixAt(i,temp.matrix)});snow.instanceMatrix.needsUpdate=true}for(const t of targets)t.holo.rotation.y+=dt*.5;
 zoom=Math.max(0,zoom-dt);
 const distance=zoom>0?.80:1;
 cameraOffset.set(13*distance,13.4*distance,22*distance);
 if(innerWidth<700)cameraOffset.multiplyScalar(1.22);
 if(mapOpen){desired.set(0,innerWidth<700?174:128,innerWidth<700?39:48);lookTarget.set(0,0,0);}
 else {desired.copy(pos).add(cameraOffset);lookTarget.set(pos.x,1.1,pos.z-3);}
 const blend=reducedMotion?1:1-Math.exp(-4.2*dt);
 camera.position.lerp(desired,blend);
 lookAt.lerp(lookTarget,blend);
 camera.lookAt(lookAt);
 renderer.render(scene,camera);
 }
 requestAnimationFrame(frame);
 const initialSnow=document.getElementById('snow');initialSnow.setAttribute('aria-pressed',snow.visible);initialSnow.textContent='Nieve: '+(snow.visible?'sí':'no');
 return{backend,action,toggleMap(){mapOpen=!mapOpen;return mapOpen},pause(value){paused=value;clearInput()},toggleSnow(){snow.visible=!snow.visible;return snow.visible},toggleSound(){muted=!muted;if(!muted){if(audioContext){audio??=new audioContext();audio.resume().catch(()=>{})}}return !muted}};
}
