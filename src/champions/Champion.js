import * as THREE from 'three';
import { HealthBar } from '../ui/HealthBar.js';

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

        // Add health bar
        this.healthBar = new HealthBar(this.health, 1.5, 0.15);
        this.healthBar.container.position.y = 2.5;
        this.mesh.add(this.healthBar.container);
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

        // Update health bar
        this.healthBar.update(this.health, window.camera);
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

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.mesh.remove(this.healthBar.container);
        }
    }
}
