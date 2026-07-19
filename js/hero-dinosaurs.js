import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.querySelector('.hero__background');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (container && !prefersReducedMotion) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  const bodies = [];

  let modelTemplate = null;
  let worldWidth = 1;
  let worldHeight = 1;
  let floorY = 0;
  let leftX = 0;
  let rightX = 0;

  const count = 9;
  const baseRotationX = Math.PI / 2;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = 'hero__dinosaurs';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);

  camera.position.set(0, 0, 12);

  scene.add(new THREE.AmbientLight(0xffffff, 2.5));

  const keyLight = new THREE.DirectionalLight(0xffffff, 5.8);
  keyLight.position.set(-5, 7, 9);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffddd6, 3.2);
  fillLight.position.set(5, -1, 7);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x8fd5ff, 2.4);
  rimLight.position.set(2, 4, -6);
  scene.add(rimLight);

  const frontLight = new THREE.PointLight(0xffffff, 100, 18);
  frontLight.position.set(0, 0, 7);
  scene.add(frontLight);

  const random = (min, max) => min + Math.random() * (max - min);

  const normalizeModel = (model) => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);
    model.position.sub(center);
    model.scale.setScalar(1 / Math.max(size.x, size.y, size.z, 1));

    model.traverse((child) => {
      if (!child.isMesh) return;

      child.material = child.material.clone();
      child.material.roughness = Math.min(child.material.roughness ?? 0.5, 0.64);
      child.material.metalness = Math.min(child.material.metalness ?? 0.08, 0.16);
    });
  };

  const syncBody = (body) => {
    body.mesh.position.set(body.x, body.y, body.z);
    body.mesh.rotation.set(baseRotationX, body.yaw, body.angle);
  };

  const createBody = (index) => {
    const scale = Math.min(worldWidth, worldHeight) * random(0.28, 0.42);
    const mesh = modelTemplate.clone(true);
    const body = {
      mesh,
      scale,
      halfWidth: scale * 0.42,
      halfHeight: scale * 0.24,
      x: random(worldWidth * 0.05, worldWidth * 0.44),
      y: worldHeight / 2 + scale * 0.8 + index * random(0.55, 0.95),
      z: random(-0.25, 0.25),
      vx: random(-0.8, 0.8),
      vy: random(-1.5, -0.4),
      angle: random(-0.7, 0.7),
      yaw: random(-0.45, 0.45),
      angularVelocity: random(-1.2, 1.2),
      bounce: random(0.05, 0.12),
      mass: scale * scale,
    };

    mesh.scale.setScalar(scale);
    scene.add(mesh);
    syncBody(body);
    return body;
  };

  const getColliderVertices = (body) => {
    const cos = Math.cos(body.angle);
    const sin = Math.sin(body.angle);
    const points = [
      { x: -body.halfWidth, y: -body.halfHeight },
      { x: body.halfWidth, y: -body.halfHeight },
      { x: body.halfWidth, y: body.halfHeight },
      { x: -body.halfWidth, y: body.halfHeight },
    ];

    return points.map((point) => ({
      x: body.x + point.x * cos - point.y * sin,
      y: body.y + point.x * sin + point.y * cos,
      localX: point.x,
      localY: point.y,
    }));
  };

  const projectVertices = (vertices, axis) => {
    let min = Infinity;
    let max = -Infinity;

    vertices.forEach((vertex) => {
      const value = vertex.x * axis.x + vertex.y * axis.y;

      min = Math.min(min, value);
      max = Math.max(max, value);
    });

    return { min, max };
  };

  const getAxes = (vertices) => {
    const axes = [];

    for (let index = 0; index < vertices.length; index += 1) {
      const current = vertices[index];
      const next = vertices[(index + 1) % vertices.length];
      const edgeX = next.x - current.x;
      const edgeY = next.y - current.y;
      const length = Math.hypot(edgeX, edgeY) || 1;

      axes.push({ x: -edgeY / length, y: edgeX / length });
    }

    return axes;
  };

  const findCollision = (first, second) => {
    const firstVertices = getColliderVertices(first);
    const secondVertices = getColliderVertices(second);
    const axes = [...getAxes(firstVertices), ...getAxes(secondVertices)];
    let minOverlap = Infinity;
    let bestAxis = null;

    for (const axis of axes) {
      const firstProjection = projectVertices(firstVertices, axis);
      const secondProjection = projectVertices(secondVertices, axis);
      const overlap = Math.min(firstProjection.max, secondProjection.max) - Math.max(firstProjection.min, secondProjection.min);

      if (overlap <= 0) return null;

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestAxis = axis;
      }
    }

    const centerX = second.x - first.x;
    const centerY = second.y - first.y;

    if (centerX * bestAxis.x + centerY * bestAxis.y < 0) {
      bestAxis = { x: -bestAxis.x, y: -bestAxis.y };
    }

    return { axis: bestAxis, overlap: minOverlap };
  };

  const resetBodies = () => {
    bodies.splice(0).forEach((body) => scene.remove(body.mesh));

    if (!modelTemplate || window.innerWidth < 720) return;

    for (let index = 0; index < count; index += 1) {
      bodies.push(createBody(index));
    }
  };

  const resize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    worldWidth = worldHeight * camera.aspect;
    floorY = -worldHeight / 2;
    leftX = -worldWidth / 2;
    rightX = worldWidth / 2;

    resetBodies();
  };

  const keepInsideWorld = (body) => {
    const vertices = getColliderVertices(body);
    const minX = Math.min(...vertices.map((vertex) => vertex.x));
    const maxX = Math.max(...vertices.map((vertex) => vertex.x));
    const minY = Math.min(...vertices.map((vertex) => vertex.y));

    if (minY < floorY) {
      const penetration = floorY - minY;

      body.y += penetration;
      body.vy *= -body.bounce;
      body.vx *= 0.72;
      body.angularVelocity *= 0.68;

      if (Math.abs(body.vy) < 0.06) body.vy = 0;
      if (Math.abs(body.vx) < 0.02) body.vx = 0;
      if (Math.abs(body.angularVelocity) < 0.025) body.angularVelocity = 0;
    }

    if (minX < leftX) {
      body.x += leftX - minX;
      body.vx = Math.abs(body.vx) * 0.25;
      body.angularVelocity *= 0.7;
    }

    if (maxX > rightX) {
      body.x -= maxX - rightX;
      body.vx = -Math.abs(body.vx) * 0.25;
      body.angularVelocity *= 0.7;
    }
  };

  const solveCollisions = () => {
    for (let pass = 0; pass < 6; pass += 1) {
      for (let firstIndex = 0; firstIndex < bodies.length; firstIndex += 1) {
        const first = bodies[firstIndex];

        for (let secondIndex = firstIndex + 1; secondIndex < bodies.length; secondIndex += 1) {
          const second = bodies[secondIndex];
          const collision = findCollision(first, second);

          if (!collision) continue;

          const { axis, overlap } = collision;
          const firstShare = second.mass / (first.mass + second.mass);
          const secondShare = first.mass / (first.mass + second.mass);

          first.x -= axis.x * overlap * firstShare;
          first.y -= axis.y * overlap * firstShare;
          second.x += axis.x * overlap * secondShare;
          second.y += axis.y * overlap * secondShare;

          const relativeVx = second.vx - first.vx;
          const relativeVy = second.vy - first.vy;
          const velocityAlongNormal = relativeVx * axis.x + relativeVy * axis.y;

          first.angularVelocity -= axis.x * overlap * 0.16;
          second.angularVelocity += axis.x * overlap * 0.16;

          if (velocityAlongNormal < 0) {
            const impulse = -velocityAlongNormal * 0.28;

            first.vx -= axis.x * impulse * firstShare;
            first.vy -= axis.y * impulse * firstShare;
            second.vx += axis.x * impulse * secondShare;
            second.vy += axis.y * impulse * secondShare;
          }
        }
      }

      bodies.forEach(keepInsideWorld);
    }
  };

  const updateBody = (body, delta) => {
    body.vy -= 16 * delta;
    body.vx *= 0.992;
    body.vy *= 0.995;
    body.angularVelocity *= 0.987;

    body.x += body.vx * delta;
    body.y += body.vy * delta;
    body.angle += body.angularVelocity * delta;

    keepInsideWorld(body);
  };

  const animate = () => {
    const delta = Math.min(clock.getDelta(), 0.033);

    bodies.forEach((body) => updateBody(body, delta));
    solveCollisions();
    bodies.forEach(syncBody);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resize);

  loader.load('img/icons/Dinosaur.glb', (gltf) => {
    modelTemplate = gltf.scene;
    normalizeModel(modelTemplate);
    resize();
  });

  resize();
  animate();
}
