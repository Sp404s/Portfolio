import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

const log = (...args) => console.log("[hero-block-scene]", ...args);
const warn = (...args) => console.warn("[hero-block-scene]", ...args);
const errorLog = (...args) => console.error("[hero-block-scene]", ...args);

const container = document.getElementById("hero-canvas");
log("container", container);

if (!container) {
  errorLog("Container #hero-canvas not found.");
} else {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);

  let camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
  camera.position.set(0, 3.2, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  let environmentMap = null;
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  new EXRLoader().load(
    "assets/hdri/wooden_studio_09_4k.exr",
    (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = envMap;
      environmentMap = envMap;
      texture.dispose();
      pmremGenerator.dispose();
      window.dispatchEvent(new Event("hero-hdri-loaded"));
    }
  );

  const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
  sunLight.position.set(8, 12, 5);
  sunLight.castShadow = true;
  sunLight.receiveShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 30;
  sunLight.shadow.camera.left = -10;
  sunLight.shadow.camera.right = 10;
  sunLight.shadow.camera.top = 10;
  sunLight.shadow.camera.bottom = -10;
  sunLight.shadow.bias = -0.0001;
  sunLight.shadow.normalBias = 0.05;
  scene.add(sunLight);

  const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5a3d, 0.45);
  skyLight.position.set(0, 10, 0);
  scene.add(skyLight);

  const fillLight = new THREE.DirectionalLight(0x88aaff, 0.35);
  fillLight.position.set(-3, 5, 4);
  fillLight.castShadow = false;
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffcc88, 0.25);
  backLight.position.set(-2, 3, -5);
  backLight.castShadow = false;
  scene.add(backLight);

  const groundBounceLight = new THREE.PointLight(0x8b5a2b, 0.2);
  groundBounceLight.position.set(0, -0.5, 0);
  groundBounceLight.castShadow = false;
  scene.add(groundBounceLight);

  const cloudShadowLight = new THREE.DirectionalLight(0xccddff, 0.15);
  cloudShadowLight.position.set(3, 8, 2);
  cloudShadowLight.castShadow = true;
  cloudShadowLight.shadow.mapSize.set(1024, 1024);
  cloudShadowLight.shadow.radius = 3;
  scene.add(cloudShadowLight);

  const groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })
  );
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = -1;
  groundPlane.receiveShadow = true;
  scene.add(groundPlane);

  const gridHelper = new THREE.GridHelper(20, 20, 0x88aa88, 0x446644);
  gridHelper.position.y = -0.95;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.3;
  scene.add(gridHelper);

  // Use lights from the exported scene for closer Blender match.

  const loader = new GLTFLoader();
  let hasModel = false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerActive = false;
  let hoveredKey = null;
  const keyMeshes = [];
  const originalPositions = new Map();
  const pressDepth = 0.5;
  const pressLerp = 0.18;
  let baseCamPos = null;
  let baseCamRot = null;

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
    const distance = 0.2 * Math.max(fitHeightDistance, fitWidthDistance);

    camera.position.set(0, distance + size.y * 0.25, distance);
    camera.position.z -= distance * 0.5;
    camera.lookAt(0, 0, 0);
    camera.rotation.z = 0;
  };

  const addTestCube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    frameObject(cube);
    log("test cube added");
  };

  const collectKeyMeshes = (root) => {
    const candidates = [];
    root.traverse((child) => {
      if (child.isMesh) candidates.push(child);
    });

    const filtered = candidates.filter((mesh) => {
      const name = mesh.name || "";
      if (/camera|light|камера|свет/i.test(name)) return false;
      if (mesh.parent && (mesh.parent.isCamera || mesh.parent.isLight)) return false;
      return true;
    });
    const keys = filtered.length ? filtered : candidates;

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

  const setBaseCamera = () => {
    baseCamPos = camera.position.clone();
    baseCamRot = camera.rotation.clone();
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

  const onResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    log("resize", { width, height });
    if (width === 0 || height === 0) {
      warn("Container has zero size.");
    }
    if (camera.isPerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(onResize);
  });

  onResize();

  log("loading model", "assets/models/hero_block.glb");
    loader.load(
      "assets/models/hero_block.glb",
      (gltf) => {
        log("model loaded");
      const model = gltf.scene;
      model.traverse((child) => {
        if (child.isLight && /sun|солнце/i.test(child.name || "")) {
          child.visible = true;
          child.intensity *= 0.02;
        } else if (child.isLight) {
          child.intensity *= 0.1;
        }
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        if (child.isDirectionalLight) {
          child.castShadow = true;
          child.shadow.mapSize.set(2048, 2048);
          child.shadow.bias = -0.0002;
        }
      });
      scene.add(model);
      hasModel = true;
      const embeddedCameras = gltf.cameras || [];
      const sceneCameras = [];
      model.traverse((child) => {
        if (child.isCamera) sceneCameras.push(child);
      });

      const namedScene = sceneCameras.find((cam) => cam.name === "Camera.002");
      const namedEmbedded = embeddedCameras.find((cam) => cam.name === "Camera.002");
      const pickedCamera =
        namedScene || namedEmbedded || sceneCameras[0] || embeddedCameras[0] || null;

      if (pickedCamera) {
        camera = pickedCamera;
        if (camera.isPerspectiveCamera) {
          camera.near = 0.01;
          camera.far = 1000;
          camera.updateProjectionMatrix();
        }
        if (!camera.parent) {
          scene.add(camera);
        }
        camera.updateMatrixWorld(true);
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        camera.position.addScaledVector(forward, 0.4);
        camera.position.x += 0.35;
        log("using embedded camera", camera.name || "unnamed");
        setBaseCamera();
        onResize();
      } else {
        frameObject(model);
        setBaseCamera();
      }

        keyMeshes.push(...collectKeyMeshes(model));
        window.dispatchEvent(new Event("hero-model-loaded"));
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
    if (baseCamPos && baseCamRot) {
      const targetPos = baseCamPos.clone();
      targetPos.x += pointer.x * 0.02;
      targetPos.y += pointer.y * 0.015;
      camera.position.lerp(targetPos, 0.03);
      camera.rotation.x = baseCamRot.x + (-pointer.y * 0.003);
      camera.rotation.y = baseCamRot.y + (pointer.x * 0.004);
    }
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
