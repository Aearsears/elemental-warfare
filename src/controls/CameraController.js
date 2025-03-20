import * as THREE from 'three';

export class CameraController {
    constructor(camera, speed = 0.5) {
        this.camera = camera;
        this.cameraSpeed = speed;
        this.minZoom = 5;
        this.maxZoom = 20;
        this.zoomSpeed = 1;
        this.currentZoom = 18;
        this.cameraAngle = Math.PI / 6;
        this.cameraOffset = new THREE.Vector3();
    }

    initialize(playerPosition) {
        this.cameraOffset = new THREE.Vector3(
            playerPosition.x,
            this.currentZoom,
            playerPosition.z - this.currentZoom * Math.tan(this.cameraAngle)
        );

        this.initializeZoom();
        this.updatePosition();
    }

    initializeZoom() {
        document.addEventListener(
            'wheel',
            (event) => {
                event.preventDefault();
                const zoomDelta = event.deltaY > 0 ? 1 : -1;
                this.currentZoom = Math.max(
                    this.minZoom,
                    Math.min(
                        this.maxZoom,
                        this.currentZoom + zoomDelta * this.zoomSpeed
                    )
                );
                this.updatePosition();
            },
            { passive: false }
        );
    }

    updatePosition() {
        const height = this.currentZoom;
        const distance = height * Math.tan(this.cameraAngle);

        this.cameraOffset.y = height;
        this.camera.position.copy(this.cameraOffset);

        const lookAtPoint = new THREE.Vector3(
            this.cameraOffset.x,
            0,
            this.cameraOffset.z + distance
        );
        this.camera.lookAt(lookAtPoint);
    }

    move(inputKeys) {
        const movementVector = new THREE.Vector2(0, 0);

        if (inputKeys['ArrowUp']) movementVector.y += this.cameraSpeed;
        if (inputKeys['ArrowDown']) movementVector.y -= this.cameraSpeed;
        if (inputKeys['ArrowLeft']) movementVector.x += this.cameraSpeed;
        if (inputKeys['ArrowRight']) movementVector.x -= this.cameraSpeed;

        if (movementVector.length() > 0) {
            movementVector.normalize().multiplyScalar(this.cameraSpeed);
            this.cameraOffset.x += movementVector.x;
            this.cameraOffset.z += movementVector.y;
            this.updatePosition();
        }
    }
}
