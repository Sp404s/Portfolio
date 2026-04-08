import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

const container = document.getElementById("project-viewer");

if (container) {
  const startViewer = () => {
    const loaderWrap = document.getElementById("project-viewer-loader");
    const updateProgress = () => {};

    const hideLoader = () => {
      if (!loaderWrap) return;
      loaderWrap.classList.add("is-hidden");
      setTimeout(() => loaderWrap.remove(), 400);
    };

    const manager = new THREE.LoadingManager();
    manager.onProgress = () => {};
    manager.onLoad = () => {
      updateProgress(100);
      hideLoader();
      if (renderer) {
        renderer.domElement.style.opacity = "1";
      }
      requestRender();
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 6.0;
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 0.3s ease";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const viewLight = new THREE.DirectionalLight(0xffffff, 0.4);
    viewLight.castShadow = false;
    const viewLightTarget = new THREE.Object3D();
    scene.add(viewLightTarget);
    viewLight.target = viewLightTarget;
    scene.add(viewLight);

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 1.5, 4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 0.3;
    controls.maxDistance = 10;

    const loader = new GLTFLoader(manager);
    scene.environment = null;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const hdriLoader = new EXRLoader(manager);
    hdriLoader.load(
      "assets/HDRI/monochrome_studio_02_4k.exr",
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.center.set(0.5, 0.5);
        texture.rotation = Math.PI;
        texture.needsUpdate = true;
        const envMap = pmrem.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        texture.dispose();
        pmrem.dispose();
        window.dispatchEvent(new Event("project-hdri-loaded"));
        requestRender();
      },
      undefined,
      (error) => {
        console.warn("Project viewer: не удалось загрузить HDRI.", error);
        window.dispatchEvent(new Event("project-hdri-loaded"));
      }
    );

    const modelUrl = container.dataset.model;
    const modelName = container.dataset.modelName || "3D модель";
    if (!modelUrl) {
      hideLoader();
      console.error("Project viewer: data-model is missing on #project-viewer.");
      window.dispatchEvent(new Event("project-model-loaded"));
    } else {
      const safeModelUrl = encodeURI(modelUrl)
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");

      loader.load(
        safeModelUrl,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isLight) {
              child.visible = false;
              child.intensity = 0;
            }
            if (child.isMesh) {
              child.castShadow = false;
              child.receiveShadow = false;
              const material = child.material;
              if (material) {
                if (Array.isArray(material)) {
                  material.forEach((mat) => {
                    mat.envMapIntensity = 0.6;
                    mat.needsUpdate = true;
                  });
                } else {
                  material.envMapIntensity = 0.6;
                  material.needsUpdate = true;
                }
              }
            }
          });
          scene.add(model);
          model.rotation.y = THREE.MathUtils.degToRad(45);

          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          model.position.sub(center);

          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = (camera.fov * Math.PI) / 180;
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
          cameraZ *= 1.0;

          camera.position.set(0, maxDim * 0.2, cameraZ);
          camera.near = cameraZ / 100;
          camera.far = cameraZ * 100;
          camera.updateProjectionMatrix();

          controls.minDistance = Math.max(maxDim * 0.02, 0.05);
          controls.maxDistance = Math.max(maxDim * 5, 10);
          controls.target.set(0, 0, 0);
          controls.update();
          window.dispatchEvent(new Event("project-model-loaded"));
          requestRender();
        },
        (event) => {
          if (!event || !event.total) return;
          updateProgress((event.loaded / event.total) * 100);
        },
        (error) => {
          hideLoader();
          console.warn(`Project viewer: не удалось загрузить ${modelName}.`, error);
          window.dispatchEvent(new Event("project-model-loaded"));
        }
      );
    }

    let renderScheduled = false;
    const render = () => {
      renderScheduled = false;
      viewLight.position.copy(camera.position);
      viewLightTarget.position
        .copy(camera.position)
        .add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10));
      renderer.render(scene, camera);
    };

    const requestRender = () => {
      if (renderScheduled) return;
      renderScheduled = true;
      requestAnimationFrame(render);
    };

    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      requestRender();
    };

    window.addEventListener("resize", onResize);
    controls.addEventListener("change", requestRender);

    requestRender();
  };

  const startWhenIdle = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startViewer, { timeout: 1500 });
    } else {
      setTimeout(startViewer, 300);
    }
  };

  const pageLoader = document.querySelector("#site-loader");
  if (pageLoader) {
    startWhenIdle();
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          startWhenIdle();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(container);
  } else {
    startWhenIdle();
  }
}
