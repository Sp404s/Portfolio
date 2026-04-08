import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const log = (...args) => console.log("[keyboard-scene]", ...args);
const warn = (...args) => console.warn("[keyboard-scene]", ...args);
const errorLog = (...args) => console.error("[keyboard-scene]", ...args);

const container = document.getElementById("keycap-canvas");
log("container", container);

if (!container) {
  errorLog("Container #keycap-canvas not found.");
} else {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 3.2, 0.1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(2.5, 3, 2);
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
  fillLight.position.set(-2, 2, 1.5);
  scene.add(fillLight);

  const loader = new GLTFLoader();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerActive = false;
  const keyMeshes = [];
  const originalPositions = new Map();
  let hoveredKey = null;
  const pressDepth = 0.5;
  const pressLerp = 0.18;
  let hasModel = false;

  const frameObject = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    log("model size", size);
    log("model center", center);

    object.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = 1.25 * Math.max(fitHeightDistance, fitWidthDistance);

    camera.position.set(0, distance + size.y * 0.6, 0.01);
    camera.lookAt(0, 0, 0);
  };

  const collectKeyMeshes = (root) => {
    const candidates = [];
    root.traverse((child) => {
      if (child.isMesh) candidates.push(child);
    });

    const named = candidates.filter((mesh) => /key/i.test(mesh.name));
    const keys = named.length ? named : candidates;

    keys.forEach((mesh) => {
      originalPositions.set(mesh, mesh.position.clone());
    });

    return keys;
  };

  const updatePointer = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const updateHover = () => {
    if (!keyMeshes.length || !pointerActive) {
      hoveredKey = null;
      return;
    }
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(keyMeshes, true);
    const hit = hits[0]?.object || null;

    if (hit !== hoveredKey) {
      hoveredKey = hit;
    }
  };

  renderer.domElement.addEventListener("pointermove", (event) => {
    updatePointer(event);
    pointerActive = true;
  });

  renderer.domElement.addEventListener("pointerleave", () => {
    hoveredKey = null;
    pointerActive = false;
  });

  const addTestCube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    frameObject(cube);
    log("test cube added");
  };

  const onResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    log("resize", { width, height });
    if (width === 0 || height === 0) {
      warn("Container has zero size.");
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(onResize);
  });

  onResize();

  log("loading model", "assets/models/keyboard.glb");
  loader.load(
    "assets/models/keyboard.glb",
    (gltf) => {
      log("model loaded");
      const model = gltf.scene;
      model.rotation.set(THREE.MathUtils.degToRad(-25), Math.PI * 2, Math.PI * 2);
      scene.add(model);
      hasModel = true;
      keyMeshes.push(...collectKeyMeshes(model));
      frameObject(model);
    },
    (event) => {
      if (event.total) {
        const percent = ((event.loaded / event.total) * 100).toFixed(1);
        log(`loading progress ${percent}%`);
      }
    },
    (err) => {
      errorLog("model load failed", err);
      addTestCube();
    }
  );

  const animate = () => {
    requestAnimationFrame(animate);
    updateHover();
    if (keyMeshes.length) {
      keyMeshes.forEach((mesh) => {
        const base = originalPositions.get(mesh);
        if (!base) return;
        const targetY = mesh === hoveredKey ? base.y - pressDepth : base.y;
        mesh.position.y += (targetY - mesh.position.y) * pressLerp;
      });
    }
    renderer.render(scene, camera);
  };

  animate();

  setTimeout(() => {
    if (!hasModel) {
      warn("Model not loaded yet, adding test cube.");
      addTestCube();
    }
  }, 2000);
}
