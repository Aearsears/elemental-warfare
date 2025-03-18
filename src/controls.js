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

        // Initialize camera position
        this.cameraOffset = new THREE.Vector3(0, this.currentZoom * 0.8, 0);

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
        // Update camera position based on current offset
        this.camera.position.copy(this.cameraOffset);
        this.camera.lookAt(this.player.position);
    }

    update() {
        // Update camera position based on WASD
        if (this.keys['w']) this.cameraOffset.z -= this.cameraSpeed;
        if (this.keys['s']) this.cameraOffset.z += this.cameraSpeed;
        if (this.keys['a']) this.cameraOffset.x -= this.cameraSpeed;
        if (this.keys['d']) this.cameraOffset.x += this.cameraSpeed;

        // Update player position based on right-click target
        if (this.targetPosition) {
            const direction = this.targetPosition
                .clone()
                .sub(this.player.position);
            if (direction.length() > this.playerSpeed) {
                direction.normalize();
                this.player.position.add(
                    direction.multiplyScalar(this.playerSpeed)
                );
            } else {
                this.player.position.copy(this.targetPosition);
                this.targetPosition = null;
            }
        }

        this.updateCameraPosition();
    }
}
