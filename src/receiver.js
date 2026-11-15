import { MathUtils, Vector2, Vector3 } from 'three';
import { PlayerAvatar } from './avatar.js';

export function createReceiver(scene) {
  const players = ['87','18','33'].map((number,index)=>{
    const avatar=new PlayerAvatar({number,uniform:'#154d38',trim:'#ffcd62',carriesBall:true,compact:index>0});
    avatar.number=number;
    avatar.root.name='Compañero receptor '+number;
    avatar.root.visible=false;
    avatar.ball.visible=false;
    scene.add(avatar.root);
    return avatar;
  });
  const routes=[[7, -9],[-10,-12],[-6,5]];
  const goals=new Vector2();
  const target=new Vector3();
  let chosen=0, live=false;

  function route(index, player, time, goalEnd){
    const [x,z]=routes[index];
    const side=player.z < -34 ? -1 : 1;
    goals.set(MathUtils.clamp(player.x+x+Math.sin(time*1.3+index)*1.35,-23,23),
      goalEnd ? goalEnd*(49.1+index*.65) : MathUtils.clamp(player.z+z*side,-45,45));
    return goals;
  }

  function activate(value, player, goalEnd=0) {
    live=value;
    for(const [index, avatar] of players.entries()){
      avatar.root.visible=value;
      avatar.ball.visible=false;
      if(value){
        const goal=route(index,player,0,goalEnd);
        avatar.root.position.set(goal.x,0,goal.y);
      }
    }
  }

  function aim(player) {
    const avatar=players[chosen];
    const pos=avatar.root.position;
    avatar.root.rotation.y=Math.atan2(player.x-pos.x,player.z-pos.z);
    return target.set(pos.x,1.36,pos.z);
  }

  function update(dt, player, passing, time, goalEnd=0) {
    if(!live)return;
    for(const [index, avatar] of players.entries()){
      const pos=avatar.root.position;
      if(passing&&index===chosen){
        aim(player);
        avatar.update(dt,false,false);
        avatar.arms[0].rotation.x=avatar.arms[1].rotation.x=-1.36;
        avatar.elbows[0].rotation.x=avatar.elbows[1].rotation.x=-.49;
        continue;
      }
      const movement=route(index,player,time,goalEnd);
      movement.x-=pos.x;
      movement.y-=pos.z;
      const speed=Math.min(7.3,movement.length()*2);
      if(speed>.04){
        movement.normalize();
        pos.x+=movement.x*speed*dt;
        pos.z+=movement.y*speed*dt;
        const angle=Math.atan2(movement.x,movement.y)-avatar.root.rotation.y;
        avatar.root.rotation.y+=Math.atan2(Math.sin(angle),Math.cos(angle))*Math.min(12*dt,1);
      }
      avatar.update(dt,speed>.6,speed>5.5);
    }
  }

  return {
    activate,update,aim,
    cycle(){chosen=(chosen+1)%players.length;},
    get position(){return players[chosen].root.position;},
    get number(){return players[chosen].number;},
    get roots(){return players.map(avatar=>avatar.root);},
    exchange(previous){
      const receiver=players[chosen];
      players[chosen]=previous;
      previous.ball.visible=false;
      previous.throwTime=0;
      return receiver;
    },
  };
}
