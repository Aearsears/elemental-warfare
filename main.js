import * as THREE from 'three';
import { PlayerController } from './src/controls/PlayerController.js';
import { Environment } from './src/environment/Environment.js';
import { Player } from './src/Player.js';
import { StatsUI } from './src/ui/StatsUI.js';
import { DebugUI } from './src/ui/DebugUI.js';

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
const player = new Player('archer', scene); // Add scene as second parameter
scene.add(player.getMesh());

// Add environment
const environment = new Environment(scene);

// Initialize player controller
const playerController = new PlayerController(
    player,
    ground,
    camera,
    environment,
    scene
);

// Create UI
const statsUI = new StatsUI(player);
const debugUI = new DebugUI(camera, environment, player);

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
    debugUI.update();
    statsUI.update();
    renderer.render(scene, camera);
}

// Add clock for animation timing
const clock = new THREE.Clock();
animate();
