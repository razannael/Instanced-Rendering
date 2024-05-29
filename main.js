import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Corrected path for OrbitControls
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'; // Corrected path for RGBELoader

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

renderer.setClearColor(0xFFEA00);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 6, 80);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

let starMesh;

rgbeLoader.load('./assets/MR_INT-005_WhiteNeons_NAD.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    gltfLoader.load('./assets/star.glb', function(glb) {
        const mesh = glb.scene.getObjectByName('Star_Star_0');
        const geometry = mesh.geometry.clone();
        const material = mesh.material;
        starMesh = new THREE.InstancedMesh(geometry, material, 8000);
        scene.add(starMesh);

        const dummy = new THREE.Object3D();
        for (let i = 0; i < 10000; i++) {
            dummy.position.x = Math.random() * 40 - 20;
            dummy.position.y = Math.random() * 40 - 20;
            dummy.position.z = Math.random() * 40 - 20;

            dummy.rotation.x = Math.random() * 2 * Math.PI;
            dummy.rotation.y = Math.random() * 2 * Math.PI;
            dummy.rotation.z = Math.random() * 2 * Math.PI;

            dummy.scale.x = dummy.scale.y = dummy.scale.z = 0.05 * Math.random();

            dummy.updateMatrix();
            starMesh.setMatrixAt(i, dummy.matrix);
            starMesh.setColorAt(i, new THREE.Color(Math.random() * 0xFFFFFF));
        }
    });
});

function animate(time) {
    if (starMesh) {
        starMesh.rotation.y = time / 1000;
        starMesh.rotation.z = time / 1000;

        starMesh.instanceMatrix.needsUpdate = true;
        starMesh.instanceColor.needsUpdate = true;  
    }

    controls.update(); 
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
