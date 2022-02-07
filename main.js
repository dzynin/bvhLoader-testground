// import "./style.scss";
import * as THREE from "./three";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { BVHLoader } from './three/examples/jsm/loaders/BVHLoader.js';
import { BVHExporter } from './BVHExporter';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/loaders/GLTFLoader.js'


// import galaxyVertexShader from "./shaders/galaxy/vertex.glsl?raw";
// import galaxyFragmentShader from "./shaders/galaxy/fragment.glsl?raw";
import pirouette from './bvh_samples/pirouette.bvh?raw'
// import gsap from "gsap";

const canvas = document.querySelector("canvas");
// const buttonExport = document.querySelector("button");
const importDiv = document.getElementsByClassName("import");
const exportDiv = document.getElementsByClassName("export");
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const loader = new BVHLoader();
const exporter = new BVHExporter();

let clipToExport, skeletonToExport;

let mixer, skeletonHelper;

console.log("pirouette", pirouette);

if (importDiv) {
    importDiv.innerHTML = pirouette
}

loader.load("./bvh_samples/pirouette.bvh", function (result) {

    // console.log("result", result);
    skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
    skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly
    skeletonToExport = result.skeleton;


    const boneContainer = new THREE.Group();
    boneContainer.add(result.skeleton.bones[0]);

    scene.add(skeletonHelper);
    scene.add(boneContainer);

    // play animation
    mixer = new THREE.AnimationMixer(skeletonHelper);
    clipToExport = result.clip;
    exporter.parse(skeletonToExport, clipToExport)
    mixer.clipAction(result.clip).setEffectiveWeight(1.0).play();
})

// Button
// const onClickExportBvh = () => {
//     if (!clipToExport || !skeletonToExport) {
//         return buttonExport.textContent = "No clip or skeleton to export."
//     }
//     exporter.parse(skeletonToExport, clipToExport)
//     // if (urlRef.current !== null) URL.revokeObjectURL(urlRef.current);
//     // urlRef.current = URL.createObjectURL(new Blob(_thatBvh, { type: "model/gltf-binary" }));
//     // const link = document.createElement("a");
//     // link.href = urlRef.current;
//     // link.download = "untitled.glb";
//     // link.click();
// };
// buttonExport.onclick = onClickExportBvh

// if(skeletonHelper){
// console.log("skeletonHelper",skeletonHelper);
// bvhExporter.parse(skeletonHelper)
// }
// console.log("BvhExporter", BvhExporter);

// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    width / height,
    0.1,
    1000
);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(width, height);
renderer.setClearColor(0xffffff);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.z = 380;
camera.position.x = 3
camera.position.y = 3

// control
const controls = new OrbitControls(camera, renderer.domElement);

//cube
const geometry = new THREE.BoxGeometry(8, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Event: on screen resizes
window.addEventListener("resize", () => {
    renderer.setSize(width, height);
});

const clock = new THREE.Clock();

// color update test
// geometry.attributes.color.needsUpdate = true;

// Animate
const tick = () => {
    // const elapsedTime = clock.getElapsedTime();

    // console.log("log", cameraPositions);

    // Update controls
    controls.update();

    camera.lookAt(
        new THREE.Vector3(0, 0, 0)
    );
    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};


tick();

// const init = () => {
//   // console.log("width", width);

// };

// init();

