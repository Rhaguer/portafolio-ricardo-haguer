import * as THREE from 'three';
import { PlayerAvatar } from './avatar.js';

export function createDefense(scene, onTackle) {
  const defenders = [
    {number:'54', x:4, z:-11, flank:-1},
    {number:'24', x:14, z:13, flank:1},
    {number:'41', x:-12, z:-24, flank:-1},
    {number:'29', x:-9, z:27, flank:1},
  ].map(config => {
    const avatar = new PlayerAvatar({number:config.number, uniform:'#e6e3da', trim:'#314d63', carriesBall:false});
    avatar.root.position.set(config.x,0,config.z);
    avatar.root.rotation.y=-Math.PI/2;
    avatar.root.name='Defensor '+config.number;
    scene.add(avatar.root);
    return {...config,avatar,state:'patrol',time:0,heading:new THREE.Vector2(),speed:0};
  });
  let grace=2;
  let clock=0;
  const intent=new THREE.Vector2();
  const racers=[...defenders];

  function update(dt, player, velocity, canPursue, reducedMotion, show=true) {
    grace=Math.max(0,grace-dt);
    clock+=dt;
    let warning=false;
    racers.sort((a,b)=>a.avatar.root.position.distanceToSquared(player)-b.avatar.root.position.distanceToSquared(player));
    for(const defender of defenders) {
      const {avatar}=defender;
      const pos=avatar.root.position;
      avatar.root.visible=show;
      if(!show){defender.state='patrol';defender.speed=0;continue;}
      const distance=Math.hypot(player.x-pos.x,player.z-pos.z);
      const active=canPursue&&grace===0;
      defender.time+=dt;
      if(!active&&defender.state!=='patrol')defender.state='patrol';
      const setState=state=>{defender.state=state;defender.time=0;};

      let speed=3.2;
      if(defender.state==='patrol') {
        intent.set(defender.x+Math.cos(clock*.71+defender.flank)*2.2-pos.x,
          defender.z+Math.sin(clock*.58)*3-pos.z);
        speed=Math.min(speed,intent.length()*2.4);
        if(active&&distance<16&&racers.indexOf(defender)<2)setState('chase');
      } else if(defender.state==='chase') {
        intent.set(player.x+velocity.x*.16+defender.flank*1.6-pos.x,player.z+velocity.y*.16-pos.z);
        speed=6.9;
        if(distance>21)setState('patrol');
        else if(distance<3.65){
          defender.heading.set(player.x-pos.x,player.z-pos.z).normalize();
          setState('windup');
        }
      } else if(defender.state==='windup') {
        intent.copy(defender.heading);
        speed=0;
        warning=true;
        if(defender.time>.39)setState('lunge');
      } else if(defender.state==='lunge') {
        intent.copy(defender.heading);
        speed=12.6;
        warning=true;
        if(distance<1.28&&active){
          grace=4;
          setState('recover');
          onTackle();
        } else if(defender.time>.37)setState('recover');
      } else {
        speed=0;
        if(defender.time>1.6)setState('patrol');
      }

      if(intent.lengthSq()>.005){
        intent.normalize();
        const heading=Math.atan2(intent.x,intent.y);
        const delta=heading-avatar.root.rotation.y;
        avatar.root.rotation.y+=Math.atan2(Math.sin(delta),Math.cos(delta))*Math.min(dt*13,1);
      }
      defender.speed=THREE.MathUtils.damp(defender.speed,speed,defender.state==='lunge'?29:14,dt);
      pos.x=THREE.MathUtils.clamp(pos.x+intent.x*defender.speed*dt,-26,26);
      pos.z=THREE.MathUtils.clamp(pos.z+intent.y*defender.speed*dt,-43,43);
      avatar.update(dt,defender.speed>1,defender.speed>5);
      if(defender.state==='windup'||defender.state==='lunge'){
        avatar.model.rotation.x=defender.state==='lunge'?.47:.26;
        if(!reducedMotion&&defender.state==='lunge')avatar.model.position.y=.18*Math.sin(Math.min(1,defender.time/.37)*Math.PI);
      }
    }
    return warning;
  }
  return {
    update,
    roots:defenders.map(defender=>defender.avatar.root),
    reset(){grace=2;for(const defender of defenders){defender.state='patrol';defender.speed=0;defender.time=0;}},
  };
}
