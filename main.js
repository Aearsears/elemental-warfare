import * as THREE from 'three';
import { PlayerController } from './src/controls/PlayerController.js';
import { Environment } from './src/environment/Environment.js';
import { Ground } from './src/environment/Ground.js';
import { Player } from './src/champions/Player.js';
import { StatsUI } from './src/ui/StatsUI.js';
import { DebugUI } from './src/ui/DebugUI.js';
import { CONFIG } from './config.js';

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
window.camera = camera;

// Update camera position for larger view
camera.position.set(0, 40, 60);

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
dirLight.position.set(20, 30, 20);
dirLight.castShadow = true;

// Configure shadow properties
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;

// Adjust shadow camera to cover entire map
dirLight.shadow.camera.left = -60;
dirLight.shadow.camera.right = 60;
dirLight.shadow.camera.top = 60;
dirLight.shadow.camera.bottom = -60;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 100;

// Optional: Add shadow camera helper for debugging
// const shadowHelper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(shadowHelper);

scene.add(dirLight);

// Ground
const ground = new Ground();
scene.add(ground.getMesh());

// Create environment first
const environment = new Environment(scene);

// Then create player with environment
const player = new Player('mage', scene, environment);
scene.add(player.getMesh());

// Initialize player controller
const playerController = new PlayerController(
    player,
    ground.getMesh(),
    camera,
    environment,
    scene
);

// Create UI
const statsUI = new StatsUI(player);

// Only create debug UI in development
let debugUI;
if (CONFIG.isDev) {
    debugUI = new DebugUI(camera, environment, player);
}

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
    environment.update(delta);
    if (CONFIG.isDev) {
        debugUI.update();
    }
    statsUI.update();
    renderer.render(scene, camera);
}

// Add clock for animation timing
const clock = new THREE.Clock();
animate();
