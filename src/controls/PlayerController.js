import * as THREE from 'three';
import { InputHandler } from './InputHandler.js';
import { CameraController } from './CameraController.js';
import { MovementController } from './MovementController.js';
import { CombatController } from './CombatController.js';
import { HoverEffect } from '../effects/HoverEffect.js';
import { CollisionManager } from '../physics/CollisionManager.js';
import { Monster } from '../environment/jungle/Monster.js';
export class PlayerController {
    constructor(player, ground, camera, environment, scene) {
        this.inputHandler = new InputHandler();
        this.cameraController = new CameraController(camera);
        this.movementController = new MovementController(
            player,
            new CollisionManager(environment)
        );
        this.combatController = new CombatController(
            player,
            environment,
            scene
        );
        this.hoverEffect = new HoverEffect(scene);

        this.ground = ground;
        this.environment = environment;

        this.initialize(player);
    }

    initialize(player) {
        this.inputHandler.initialize();
        this.cameraController.initialize(player.getPosition());
        this.initializeHoverDetection();
    }

    initializeHoverDetection() {
        document.addEventListener('mousemove', (event) => {
            event.preventDefault();
            this.inputHandler.updateMousePosition(event);
            this.checkHover(event);
        });

        document.addEventListener('mousedown', (event) => {
            event.preventDefault();
            if (event.button === 0) {
                // Left click
                this.handleLeftClick();
            } else if (event.button === 2) {
                // Right click
                this.handleRightClick();
            }
        });
    }

    checkHover(event) {
        this.inputHandler.raycaster.setFromCamera(
            this.inputHandler.mouse,
            this.cameraController.camera
        );

        const intersects = this.inputHandler.raycaster.intersectObjects(
            this.environment.getTargetableObjects(),
            true
        );

        if (intersects.length > 0) {
            const targetObject = intersects[0].object;
            const monster = targetObject.parent.userData.parent;

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

    handleLeftClick() {
        this.inputHandler.raycaster.setFromCamera(
            this.inputHandler.mouse,
            this.cameraController.camera
        );

        const intersects = this.inputHandler.raycaster.intersectObjects(
            this.environment.getTargetableObjects(),
            true
        );

        if (intersects.length > 0) {
            const target = intersects[0].object;
            const worldPosition = new THREE.Vector3();
            target.getWorldPosition(worldPosition);

            const isTargetable =
                target.userData.isTargetable ||
                target.parent?.userData?.isTargetable;
            if (
                isTargetable &&
                this.combatController.isTargetInRange(worldPosition)
            ) {
                this.combatController.handleAttack(target);
            }
        }
    }

    handleRightClick() {
        this.inputHandler.raycaster.setFromCamera(
            this.inputHandler.mouse,
            this.cameraController.camera
        );

        // Filter out any removed or dead monster meshes
        const objects = [this.ground];

        const intersects = this.inputHandler.raycaster.intersectObjects(
            objects,
            false // Set to false to only check the ground, not its children
        );

        if (intersects.length > 0) {
            const targetPosition = intersects[0].point;
            this.movementController.setTargetPosition(targetPosition);
        }
    }

    update() {
        this.cameraController.move(this.inputHandler.keys);
        this.movementController.update();
    }
}
