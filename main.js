import * as THREE from 'three';
import { PlayerController } from './src/controls.js';
import { Environment } from './src/environment.js';
import { Player } from './src/player.js';

const debug = document.createElement('div');
debug.style.position = 'fixed';
debug.style.top = '10px';
debug.style.left = '10px';
debug.style.color = 'white';
debug.style.backgroundColor = 'rgba(0,0,0,0.5)';
debug.style.padding = '10px';
document.body.appendChild(debug);

function updateDebug() {
    debug.textContent = `
        Camera: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(
        2
    )}, ${camera.position.z.toFixed(2)}
        FPS: ${Math.round(1000 / 16)}
        Trees: ${environment.trees.length}
    `;
}

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 20, 20); // Move camera back and up
camera.lookAt(0, 0, 0); // Look at center

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x228b22,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Player
const player = new Player();
scene.add(player.mesh);

// Add environment
const environment = new Environment(scene);

// Initialize player controller
const playerController = new PlayerController(player, ground, camera);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    const delta = clock.getDelta();
    requestAnimationFrame(animate);
    playerController.update();
    player.update(delta);
    updateDebug();
    renderer.render(scene, camera);
}

// Add clock for animation timing
const clock = new THREE.Clock();
animate();
