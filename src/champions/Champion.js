import * as THREE from 'three';
import { HealthBar } from '../ui/HealthBar.js';

export class Champion {
    constructor(config = {}) {
        this.scene = config.scene;
        this.mesh = this.createModel();
        this.isMoving = false;
        this.movementTime = 0;
        this.maxHealth = config.health || 100;
        this.maxMana = config.mana || 100;
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        this.speed = config.speed || 0.2;
        this.attackDamage = config.attackDamage || 10;
        this.attackRange = config.attackRange || 2;
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.attackDuration = 0.5;
        this.abilities = {};

        // Add regeneration rates (per second)
        this.healthRegenRate = config.healthRegenRate || 0;
        this.manaRegenRate = config.manaRegenRate || 0;

        // Add health bar
        this.healthBar = new HealthBar(this.health, 1.5, 0.15);
        this.healthBar.container.position.y = 2.5;
        this.mesh.add(this.healthBar.container);

        this.environment = config.environment;
        this.initializeAbilities();
    }

    initializeAbilities() {
        // Initialize each ability with scene and environment
        Object.values(this.abilities).forEach((ability) =>
            ability.initialize(this.scene, this.environment)
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
        this.abilities[key]?.use(this);
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

        // Apply regeneration
        this.regenerateResources(delta);

        // Update health bar
        this.healthBar.update(this.health, window.camera);

        // Update abilities
        Object.values(this.abilities).forEach((ability) =>
            ability.update?.(delta)
        );
        this.updateAnimation(delta);
    }

    updateAnimation(delta) {
        // Base animation that all champions will override
    }

    regenerateResources(delta) {
        // Health regeneration
        if (this.health < this.maxHealth) {
            this.health = Math.min(
                this.maxHealth,
                this.health + this.healthRegenRate * delta
            );
        }

        // Mana regeneration
        if (this.mana < this.maxMana) {
            this.mana = Math.min(
                this.maxMana,
                this.mana + this.manaRegenRate * delta
            );
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

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.mesh.remove(this.healthBar.container);
        }
    }
}
