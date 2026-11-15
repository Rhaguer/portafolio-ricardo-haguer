export const goalLine = 48;
export const fieldHalfWidth = 27;
export const posts = Object.freeze({z:58.9, crossbar:3.05, halfWidth:2.82, radius:.22});
export const pointsByPlay = Object.freeze({touchdown:6, fieldGoal:3, extraPoint:1, conversion:2});

export function endZone(position) {
  return Math.abs(position.x)<=fieldHalfWidth && Math.abs(position.z)>=goalLine && Math.abs(position.z)<=posts.z
    ? Math.sign(position.z)
    : 0;
}

export function isGoodKick(x, height) {
  const ballRadius=.16;
  return Math.abs(x)+ballRadius<posts.halfWidth-posts.radius && height-ballRadius>posts.crossbar+posts.radius;
}
