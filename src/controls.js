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
        this.minZoom = 5;
        this.maxZoom = 20;
        this.zoomSpeed = 1;
        this.currentZoom = 10;

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
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get all targetable objects including monsters
        const targetableObjects = [
            ...this.environment.destructibles,
            ...this.environment.jungleCamps.flatMap((camp) =>
                camp.monsterInstances
                    .filter((monster) => monster.isAlive)
                    .map((monster) => monster.mesh)
            )
        ];

        const intersects = this.raycaster.intersectObjects(
            targetableObjects,
            true
        );

        if (intersects.length > 0) {
            const targetObject = intersects[0].object;
            const monster = targetObject.userData.parent;

            if (monster && monster instanceof Monster) {
                this.hoverEffect.addOutline(targetObject);
                document.body.style.cursor = 'crosshair';
            } else if (targetObject.parent?.userData?.isDestructible) {
                this.hoverEffect.addOutline(targetObject);
                document.body.style.cursor = 'crosshair';
            }
        } else {
            this.hoverEffect.removeOutline();
            document.body.style.cursor = 'default';
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
                const newPosition = this.player.getPosition().clone();
                newPosition.add(
                    direction.normalize().multiplyScalar(this.playerSpeed)
                );

                // Check collisions with monsters
                const playerBox = new THREE.Box3().setFromObject(
                    this.player.getMesh()
                );
                let collisionDetected = false;

                for (const camp of this.environment.jungleCamps) {
                    for (const monster of camp.monsterInstances) {
                        if (
                            monster.isAlive &&
                            monster.checkCollision(playerBox)
                        ) {
                            collisionDetected = true;
                            break;
                        }
                    }
                    if (collisionDetected) break;
                }

                if (!collisionDetected) {
                    this.player.setPosition(
                        newPosition.x,
                        newPosition.y,
                        newPosition.z
                    );
                    this.player.setMoving(true);
                } else {
                    this.targetPosition = null;
                    this.player.setMoving(false);
                }
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

    // Update attack logic to handle monsters
    handleAttack(target) {
        if (target.userData.type === 'monster') {
            const monster = target.userData.parent;
            if (monster.isAlive) {
                monster.takeDamage(this.player.attackDamage);
            }
        } else if (target.userData.isDestructible) {
            // Get the parent group that holds the health data
            const destructibleGroup = target.userData.parentGroup;
            if (destructibleGroup && destructibleGroup.userData.health > 0) {
                // Apply damage
                destructibleGroup.userData.health -= this.player.attackDamage;

                // Visual feedback
                target.material.emissive = new THREE.Color(0xff0000);
                setTimeout(() => {
                    target.material.emissive = new THREE.Color(0x000000);
                }, 100);

                // Check if destroyed
                if (destructibleGroup.userData.health <= 0) {
                    // Destruction animation/effect
                    this.createDestructionEffect(destructibleGroup.position);

                    // Remove from scene and environment
                    this.scene.remove(destructibleGroup);
                    this.environment.destructibles =
                        this.environment.destructibles.filter(
                            (d) => d !== destructibleGroup
                        );

                    // Remove hover effect if it was being shown
                    this.hoverEffect.removeOutline();
                }
            }
        }
    }

    createDestructionEffect(position) {
        // Create particle effect for destruction
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                position.x + (Math.random() - 0.5) * 0.5,
                position.y + (Math.random() - 0.5) * 0.5,
                position.z + (Math.random() - 0.5) * 0.5
            );
            velocities.push(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.3
            );
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );

        const material = new THREE.PointsMaterial({
            color: 0x8b4513,
            size: 0.2,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // Animate particles
        const animateParticles = () => {
            const positions = particles.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i]; // x
                positions[i + 1] += velocities[i + 1] - 0.1; // y with gravity
                positions[i + 2] += velocities[i + 2]; // z
            }

            particles.geometry.attributes.position.needsUpdate = true;
        };

        // Remove particles after animation
        let frames = 0;
        const animate = () => {
            if (frames < 30) {
                animateParticles();
                frames++;
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particles);
            }
        };

        animate();
    }
}
