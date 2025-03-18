import * as THREE from 'three';
import { HealthBar } from '../ui/HealthBar.js';

export class Champion {
    constructor(config = {}) {
        this.scene = config.scene;
        this.mesh = this.createModel();
        this.isMoving = false;
        this.movementTime = 0;
        this.health = config.health || 100;
        this.mana = config.mana || 100;
        this.speed = config.speed || 0.2;
        this.attackDamage = config.attackDamage || 10;
        this.attackRange = config.attackRange || 2;
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.attackDuration = 0.5;
        this.abilities = {};

        // Add health bar
        this.healthBar = new HealthBar(this.health, 1.5, 0.15);
        this.healthBar.container.position.y = 2.5;
        this.mesh.add(this.healthBar.container);
    }

    initializeAbilities() {
        // Initialize each ability with scene
        Object.values(this.abilities).forEach((ability) =>
            ability.initialize(this.scene)
        );

        // Add key listeners
        document.addEventListener('keydown', (event) => {
            switch (event.key.toUpperCase()) {
                case 'Q':
                    this.useAbility('Q');
                    break;
                case 'W':
                    this.useAbility('W');
                    break;
                case 'E':
                    this.useAbility('E');
                    break;
                case 'R':
                    this.useAbility('R');
                    break;
            }
        });
    }

    useAbility(key) {
        if (this.abilities[key]?.use(this)) {
            // Trigger ability specific animation
            this.triggerAbilityAnimation(key);
        }
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

        // Update abilities
        Object.values(this.abilities).forEach((ability) =>
            ability.update?.(delta)
        );
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
