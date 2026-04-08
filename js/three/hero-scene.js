import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("hero-canvas");

const createNotice = (message) => {
  if (!container) return null;
  const note = document.createElement("div");
  note.className = "hero-3d__notice";
  note.textContent = message;
  container.appendChild(note);
  return note;
};

if (container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1.2, 3.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.2;
  controls.maxDistance = 8;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(2, 3, 2);
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-2, 2, 1.5);
  scene.add(fillLight);

  const loader = new GLTFLoader();

  const frameObject = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    object.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

    camera.position.set(0, size.y * 0.35, distance + size.z * 0.2);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const loadingNote = createNotice("Загрузка 3D модели...");

  loader.load(
    "assets/models/keycap.glb",
    (gltf) => {
      if (loadingNote) loadingNote.remove();
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.rotation.set(0, Math.PI, 0);

      // Make sure the keyboard is large enough to read
      const preBox = new THREE.Box3().setFromObject(model);
      const preSize = preBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(preSize.x, preSize.y, preSize.z);
      const targetMax = 2.4;
      if (maxDim > 0 && maxDim < targetMax) {
        const scale = targetMax / maxDim;
        model.scale.setScalar(scale);
      }

      scene.add(model);

      frameObject(model);
    },
    undefined,
    (error) => {
      if (loadingNote) loadingNote.remove();
      createNotice("Не удалось загрузить модель. Открой сайт через локальный сервер (например, Live Server).");
      console.warn("Не удалось загрузить модель клавиатуры", error);
    }
  );

  const onResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(onResize);
  });

  onResize();

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}
