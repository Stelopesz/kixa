"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default function Shuriken3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const light1 = new THREE.PointLight(0xb74e6f, 1.2);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x674370, 0.6);
    light2.position.set(-5, -3, 3);
    scene.add(light2);
    const light3 = new THREE.DirectionalLight(0xb74e6f, 2);
light3.position.set(0, 0, 5);
scene.add(light3);
const light4 = new THREE.DirectionalLight(0xf4bdbd, 1);
light4.position.set(0, 5, 0);
scene.add(light4);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let model: THREE.Group;
    loader.load("/xurikixa.glb", (gltf) => {
      model = gltf.scene;
      model.scale.set(2.2, 2.2, 2.2);
      model.traverse((child) => {
  if ((child as THREE.Mesh).isMesh) {
    const mesh = child as THREE.Mesh;
    mesh.material = new THREE.MeshStandardMaterial({
      color: 0xb74e6f,
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(0x36173d),
      emissiveIntensity: 0.3,
    });
  }
});
      scene.add(model);
    });

    let animId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (model) {
        model.rotation.y += 0.008;
        model.rotation.x = Math.sin(t * 0.4) * 0.15;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />;
}