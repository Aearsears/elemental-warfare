import * as THREE from 'three';

export class Champion {
    constructor(config = {}) {
        this.mesh = this.createModel();
        this.isMoving = false;
        this.movementTime = 0;
        this.health = config.health || 100;
        this.mana = config.mana || 100;
        this.speed = config.speed || 0.2;
        this.attackDamage = config.attackDamage || 10;
        this.attackRange = config.attackRange || 2;
    }

    createModel() {
        const championGroup = new THREE.Group();
        // Base model that all champions will override
        return championGroup;
    }

    update(delta) {
        // Handle animations based on isMoving state
        if (this.isMoving) {
            // Play movement animation
        } else {
            // Reset to idle animation
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
