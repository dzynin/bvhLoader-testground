// import "./style.scss";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// import galaxyVertexShader from "./shaders/galaxy/vertex.glsl?raw";
// import galaxyFragmentShader from "./shaders/galaxy/fragment.glsl?raw";
// import gsap from "gsap";
const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xff0000)
const width = window.innerWidth;
const height = window.innerHeight;

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  width / height,
  0.1,
  100
);
// camera.position.x = 3;
// camera.position.y = 3;
// camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  // alpha: true
});

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Event: on screen resizes
window.addEventListener("resize", () => {
  renderer.setSize(width, height);
});

// const clock = new THREE.Clock();

// color update test
// geometry.attributes.color.needsUpdate = true;

// Animate
const tick = () => {
  // const elapsedTime = clock.getElapsedTime();

  // camera.position.x = cameraPositions.x;
  // camera.position.y = cameraPositions.y;
  // camera.position.z = cameraPositions.z;

  // console.log("log", cameraPositions);

  // Update controls
  // todo: debounce
  // controls.update();
  // scene.background = new THREE.Color(0xff0000);
  // camera.position.z = 5;
  // camera.lookAt(
  //   new THREE.Vector3(0, 0, 0)
  // );

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};



const init = () => {
  // console.log("width", width);
  tick();

};

init();
