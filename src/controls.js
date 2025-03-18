import * as THREE from 'three';
import { CollisionManager } from './physics/CollisionManager.js';
import { HoverEffect } from './effects/HoverEffect.js';

export class PlayerController {
    constructor(player, ground, camera, environment, scene) {
        this.player = player;
        this.ground = ground;
        this.camera = camera;
        this.scene = scene;
        this.keys = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.targetPosition = null;
        this.playerSpeed = 0.2;
        this.cameraSpeed = 0.5;
        this.collisionManager = new CollisionManager(environment);
        this.environment = environment;
        this.hoverEffect = new HoverEffect(scene);

        // Add zoom configuration
        this.minZoom = 10;
        this.maxZoom = 100;
        this.zoomSpeed = 1;
        this.currentZoom = 20;

        // Add camera angle configuration
        this.cameraAngle = Math.PI / 6; // 30-degree tilt
        this.cameraDistance = 20; // Distance behind and above the view target

        // Initialize camera position centered on player
        const playerPos = player.getPosition();
        this.cameraOffset = new THREE.Vector3(
            playerPos.x,
            this.currentZoom,
            playerPos.z - this.currentZoom * Math.tan(this.cameraAngle) // Changed to minus
        );

        // Add attack binding
        this.initializeControls();
        this.updateCameraPosition();

        // Add mousemove event listener
        this.initializeHoverDetection();
    }

    initializeControls() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });

        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.handleRightClick(event);
        });

        // Add wheel event listener for zoom
        document.addEventListener(
            'wheel',
            (event) => {
                event.preventDefault();

                // Determine zoom direction (-1 for zoom in, 1 for zoom out)
                const zoomDelta = event.deltaY > 0 ? 1 : -1;

                // Calculate new zoom level
                this.currentZoom = Math.max(
                    this.minZoom,
                    Math.min(
                        this.maxZoom,
                        this.currentZoom + zoomDelta * this.zoomSpeed
                    )
                );

                this.updateCameraPosition();
            },
            { passive: false }
        );

        // Add mouse click for attacks
        document.addEventListener('click', (event) => {
            if (event.button === 0) {
                // Left click
                this.player.attack(this.environment);
            }
        });
    }

    initializeHoverDetection() {
        document.addEventListener('mousemove', (event) => {
            this.checkHoverTargets(event);
        });
    }

    checkHoverTargets(event) {
        // Convert mouse position to normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check destructibles
        const destructibles = this.environment.destructibles.map(
            (d) => d.children[0]
        ); // Get barrel mesh
        const intersects = this.raycaster.intersectObjects(destructibles);

        if (intersects.length > 0) {
            const targetObject = intersects[0].object;
            this.hoverEffect.addOutline(targetObject);
        } else {
            this.hoverEffect.removeOutline();
        }
    }

    handleRightClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster to use current camera position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.ground);

        if (intersects.length > 0) {
            this.targetPosition = intersects[0].point;
            // Use getPosition() instead of accessing position directly
            const playerPos = this.player.getPosition();
            this.targetPosition.y = playerPos.y;
        }
    }

    updateCameraPosition() {
        // Calculate camera height and distance based on zoom
        const height = this.currentZoom;
        const distance = height * Math.tan(this.cameraAngle);

        // Update camera position with tilt
        this.cameraOffset.y = height;
        this.camera.position.copy(this.cameraOffset);

        // Calculate look-at point in front of the camera
        const lookAtPoint = new THREE.Vector3(
            this.cameraOffset.x,
            0,
            this.cameraOffset.z + distance // This remains positive to look forward
        );

        this.camera.lookAt(lookAtPoint);
    }

    update() {
        // Update camera position in 2D plane
        const movementVector = new THREE.Vector2(0, 0);

        // Reversed the signs to fix inverted controls
        if (this.keys['w']) movementVector.y += this.cameraSpeed; // Changed from -=
        if (this.keys['s']) movementVector.y -= this.cameraSpeed; // Changed from +=
        if (this.keys['a']) movementVector.x += this.cameraSpeed; // Changed from -=
        if (this.keys['d']) movementVector.x -= this.cameraSpeed; // Changed from +=

        // Apply diagonal movement normalization
        if (movementVector.length() > 0) {
            movementVector.normalize().multiplyScalar(this.cameraSpeed);
            this.cameraOffset.x += movementVector.x;
            this.cameraOffset.z += movementVector.y;
        }

        // Update player position based on right-click target
        this.updatePlayerPosition();

        this.updateCameraPosition();
    }

    updatePlayerPosition() {
        if (this.targetPosition) {
            const direction = this.targetPosition
                .clone()
                .sub(this.player.getPosition());
            if (direction.length() > this.playerSpeed) {
                // Calculate new position
                const newPosition = this.player.getPosition().clone();
                newPosition.add(
                    direction.normalize().multiplyScalar(this.playerSpeed)
                );

                // Check for collisions before moving
                const oldPosition = this.player.getPosition().clone();
                this.player.setPosition(
                    newPosition.x,
                    newPosition.y,
                    newPosition.z
                );

                if (this.collisionManager.checkCollisions(this.player)) {
                    // Collision detected, revert position
                    this.player.setPosition(
                        oldPosition.x,
                        oldPosition.y,
                        oldPosition.z
                    );
                    this.targetPosition = null;
                }

                this.player.setMoving(true);
            } else {
                this.player.setPosition(
                    this.targetPosition.x,
                    this.player.getPosition().y,
                    this.targetPosition.z
                );
                this.targetPosition = null;
                this.player.setMoving(false);
            }
        } else {
            this.player.setMoving(false);
        }
    }
}
