import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import headphoneModel from '../../assets/headphone_retro.glb';

const TARGET_SIZE = 1.8;
const HOVER_SPEED = 0.6;
const HOVER_AMPLITUDE = 0.08;
const ROTATION_SPEED = 0.12;
const THEME_TINT = new THREE.Color('#f59e0b');
const THEME_TINT_STRENGTH = 0.18;

export function HeadphoneScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.1, 3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.physicallyCorrectLights = true;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const hoverGroup = new THREE.Group();
    hoverGroup.rotation.x = -0.12;
    scene.add(hoverGroup);

    const pivotGroup = new THREE.Group();
    hoverGroup.add(pivotGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(2.4, 2.2, 2.6);
    const rimLight = new THREE.DirectionalLight(0xfff1d6, 0.65);
    rimLight.position.set(-2.3, 1.4, -1.5);
    scene.add(ambientLight, keyLight, rimLight);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    let loadedModel: THREE.Object3D | null = null;
    let isDisposed = false;

    const fitModel = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      if (maxDimension > 0) {
        const scale = TARGET_SIZE / maxDimension;
        object.scale.setScalar(scale);
      }
      object.updateWorldMatrix(true, true);

      const scaledBox = new THREE.Box3().setFromObject(object);
      const center = scaledBox.getCenter(new THREE.Vector3());
      object.position.sub(center);
      object.updateWorldMatrix(true, true);

      const recenteredBox = new THREE.Box3().setFromObject(object);
      return {
        size: recenteredBox.getSize(new THREE.Vector3()),
      };
    };

    const loader = new GLTFLoader();
    loader.load(headphoneModel, (gltf) => {
      if (isDisposed) {
        return;
      }
      loadedModel = gltf.scene;
      pivotGroup.add(loadedModel);
      loadedModel.updateWorldMatrix(true, true);
      const { size } = fitModel(loadedModel);
      const maxDimension = Math.max(size.x, size.y, size.z);
      if (Number.isFinite(maxDimension) && maxDimension > 0) {
        const distance = (maxDimension / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
        camera.position.set(0, maxDimension * 0.06, distance * 1.2);
        camera.lookAt(0, 0, 0);
      }

      loadedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
      });
      loadedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (
              material instanceof THREE.MeshStandardMaterial ||
              material instanceof THREE.MeshPhysicalMaterial
            ) {
              material.color.lerp(THEME_TINT, THEME_TINT_STRENGTH);
              material.roughness = Math.max(0.35, material.roughness);
              material.metalness = Math.min(0.6, material.metalness);
            }
          });
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              material.needsUpdate = true;
            });
          } else if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
    }, undefined, (error) => {
      if (!isDisposed) {
        console.error('Failed to load headphone model', error);
      }
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) {
        return;
      }
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    let frameId: number | null = null;
    const animate = (time: number) => {
      const elapsed = time * 0.001;
      hoverGroup.position.y = Math.sin(elapsed * HOVER_SPEED) * HOVER_AMPLITUDE;
      pivotGroup.rotation.y = elapsed * ROTATION_SPEED;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      if (loadedModel) {
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
      }
      environment.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[260px] w-full overflow-visible lg:h-[360px]"
      aria-hidden="true"
    />
  );
}
