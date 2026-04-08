import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("about-3d");

if (container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
  camera.position.set(0, 1.5, 4);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 5, 4);
  scene.add(key);

  const loader = new GLTFLoader();
  let blenderMesh = null;
  let floorY = null;
  let blenderParent = null;
  let velocity = 0;
  const clock = new THREE.Clock();
  const tmpVec = new THREE.Vector3();

  const onResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  loader.load("assets/models/Interectiv.glb", (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    model.traverse((child) => {
      if (!child.isMesh) return;
      const name = (child.name || "").toLowerCase();
      if (name.includes("plane") || name.includes("плоск")) {
        const planeBox = new THREE.Box3().setFromObject(child);
        floorY = planeBox.max.y;
      } else if (name.includes("blender")) {
        blenderMesh = child;
        blenderParent = child.parent || model;
      }
    });

    if (blenderMesh) {
      blenderMesh.frustumCulled = false;
      const box = new THREE.Box3().setFromObject(blenderMesh);
      const size = box.getSize(new THREE.Vector3());
      blenderMesh.getWorldPosition(tmpVec);
      tmpVec.y += size.y * 0.6 + 0.2;
      if (blenderParent) {
        blenderParent.worldToLocal(tmpVec);
        blenderMesh.position.copy(tmpVec);
      }
    }

    if (floorY === null) {
      const modelBox = new THREE.Box3().setFromObject(model);
      floorY = modelBox.min.y;
    }

    const embeddedCameras = gltf.cameras || [];
    const sceneCameras = [];
    model.traverse((child) => {
      if (child.isCamera) sceneCameras.push(child);
    });

    const picked =
      sceneCameras.find((cam) => cam.name) ||
      embeddedCameras.find((cam) => cam.name) ||
      sceneCameras[0] ||
      embeddedCameras[0] ||
      null;

    if (picked) {
      camera = picked;
      if (!camera.parent) scene.add(camera);
      camera.updateMatrixWorld(true);
    }

    onResize();
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(onResize);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.033);
    if (blenderMesh && floorY !== null) {
      velocity -= 2.2 * dt;
      blenderMesh.getWorldPosition(tmpVec);
      tmpVec.y += velocity * dt;
      if (tmpVec.y <= floorY) {
        tmpVec.y = floorY;
        velocity = 0;
      }
      if (blenderParent) {
        blenderParent.worldToLocal(tmpVec);
        blenderMesh.position.copy(tmpVec);
      }
    }
    renderer.render(scene, camera);
  };
  animate();
}
