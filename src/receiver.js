import { MathUtils, Vector2, Vector3 } from 'three';
import { PlayerAvatar } from './avatar.js';

export function createReceiver(scene) {
  let avatar = new PlayerAvatar({number:'87',uniform:'#154d38',trim:'#ffcd62',carriesBall:true});
  avatar.number='87';
  avatar.root.name = 'Compañero receptor 87';
  avatar.root.visible = false;
  avatar.ball.visible = false;
  scene.add(avatar.root);
  const goal = new Vector2();
  const liveCatch = new Vector3();
  let live = false;

  function activate(value, player, goalEnd=0) {
    live = value;
    avatar.root.visible = value;
    avatar.ball.visible = false;
    if (value) {
      avatar.root.position.set(MathUtils.clamp(player.x + (player.x>10?-7:7),-21,21),0,goalEnd?goalEnd*49.1:MathUtils.clamp(player.z - 9,-45,45));
    }
  }

  function aim(player) {
    const pos=avatar.root.position;
    avatar.root.rotation.y=Math.atan2(player.x-pos.x,player.z-pos.z);
    liveCatch.set(pos.x,1.36,pos.z);
    return liveCatch;
  }

  function update(dt, player, passing, time, goalEnd=0) {
    if (!live) return;
    const pos=avatar.root.position;

    let speed=0;
    if (passing) {
      aim(player);
    } else {
      goal.set(MathUtils.clamp(player.x + (player.x>10?-7:7) + Math.sin(time*1.3)*1.9,-22,22)-pos.x,
        (goalEnd?goalEnd*49.1:MathUtils.clamp(player.z + (player.z < -34 ? 9 : -9),-45,45))-pos.z);
      speed=Math.min(7,goal.length()*2);
      if (speed>.04) {
        goal.normalize();
        pos.x+=goal.x*speed*dt;
        pos.z+=goal.y*speed*dt;
        const direction=Math.atan2(goal.x,goal.y)-avatar.root.rotation.y;
        avatar.root.rotation.y+=Math.atan2(Math.sin(direction),Math.cos(direction))*Math.min(12*dt,1);
      }
    }
    avatar.update(dt,speed>.6,speed>5.5);
    if (passing) {
      avatar.arms[0].rotation.x=-1.36;
      avatar.arms[1].rotation.x=-1.36;
      avatar.elbows[0].rotation.x=-.49;
      avatar.elbows[1].rotation.x=-.49;
    }
  }

  return {
    activate,update,aim,
    get position(){return avatar.root.position;},
    get number(){return avatar.number;},
    exchange(previous){
      const receiver=avatar;
      avatar=previous;
      avatar.ball.visible=false;
      avatar.throwTime=0;
      return receiver;
    },
  };
}
