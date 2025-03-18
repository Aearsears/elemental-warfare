import * as THREE from 'three';

export class PlayerController {
    constructor(player, ground, camera) {
        this.player = player;
        this.ground = ground;
        this.camera = camera;
        this.keys = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.targetPosition = null;
        this.playerSpeed = 0.2;
        this.cameraSpeed = 0.5;

        // Add zoom configuration
        this.minZoom = 10;
        this.maxZoom = 50;
        this.zoomSpeed = 1;
        this.currentZoom = 20;

        // Add camera angle configuration
        this.cameraAngle = Math.PI / 6; // 30-degree tilt
        this.cameraDistance = 20; // Distance behind and above the view target

        // Initialize camera position for top-down view
        const initialHeight = this.currentZoom;
        this.cameraOffset = new THREE.Vector3(
            0,
            initialHeight,
            initialHeight * Math.tan(this.cameraAngle)
        );

        this.initializeControls();
        this.updateCameraPosition();
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
    }

    handleRightClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster to use current camera position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.ground);

        if (intersects.length > 0) {
            this.targetPosition = intersects[0].point;
            this.targetPosition.y = this.player.position.y;
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
            this.cameraOffset.z + distance
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
                direction.normalize();
                this.player.setPosition(
                    this.player.getPosition().x +
                        direction.x * this.playerSpeed,
                    this.player.getPosition().y,
                    this.player.getPosition().z + direction.z * this.playerSpeed
                );
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
