import { Box3, Ray, Vector3, MathUtils } from 'three';

export function createCameraCollision(objects) {
  const radius = .36;
  // The scene is static. Expanded bounds approximate the camera's near volume.
  const bounds = objects.filter(object => object.isMesh && !object.isInstancedMesh)
    .map(object => new Box3().setFromObject(object).expandByScalar(radius));
  const ray = new Ray();
  const hit = new Vector3();
  const delta = new Vector3();
  let distance;

  function clearDistance(origin, direction, length) {
    ray.set(origin, direction);
    let safe = length;
    for (const box of bounds) {
      if (box.containsPoint(origin)) continue;
      const point = ray.intersectBox(box, hit);
      if (point) safe = Math.min(safe, Math.max(.08, origin.distanceTo(point) - .08));
    }
    return safe;
  }

  return {
    apply(origin, desired, dt, instant = false) {
      delta.subVectors(desired, origin);
      const length = delta.length();
      if (length < .001) return;
      delta.multiplyScalar(1 / length);
      const safe = clearDistance(origin, delta, length);
      distance = instant || distance === undefined || safe < distance
        ? safe
        : MathUtils.damp(distance, safe, 3.4, dt);
      desired.copy(origin).addScaledVector(delta, distance);
    },
    occluded(origin, target) {
      delta.subVectors(target, origin);
      const length = delta.length();
      if (length < .001) return false;
      return clearDistance(origin, delta.multiplyScalar(1 / length), length) < length - .65;
    },
    reset() { distance = undefined; },
  };
}
