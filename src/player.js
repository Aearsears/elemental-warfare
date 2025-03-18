import * as THREE from 'three';

export class Player {
    constructor() {
        this.mesh = this.createPlayerModel();
        this.isMoving = false;
        this.movementTime = 0;
    }

    createPlayerModel() {
        // Create a group to hold all player parts
        const playerGroup = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.75);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3366ff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        playerGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2;
        head.castShadow = true;
        playerGroup.add(head);

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.25, 0.75, 0.25);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x3366ff });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.6, 1.5, 0);
        leftArm.castShadow = true;
        playerGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.6, 1.5, 0);
        rightArm.castShadow = true;
        playerGroup.add(rightArm);

        // Store references for animation
        this.leftArm = leftArm;
        this.rightArm = rightArm;
        this.body = body;

        return playerGroup;
    }

    update(delta) {
        if (this.isMoving) {
            this.movementTime += delta * 5;

            // Arm swing animation
            this.leftArm.rotation.x = Math.sin(this.movementTime) * 0.5;
            this.rightArm.rotation.x = -Math.sin(this.movementTime) * 0.5;

            // Slight body bob
            this.body.position.y =
                1 + Math.abs(Math.sin(this.movementTime)) * 0.1;
        } else {
            // Reset animations when not moving
            this.movementTime = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
            this.body.position.y = 1;
        }
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }

    getPosition() {
        return this.mesh.position;
    }

    setMoving(moving) {
        this.isMoving = moving;
    }
}
