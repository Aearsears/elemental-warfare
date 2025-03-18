import * as THREE from 'three';
import { Warrior } from './champions/Warrior.js';
import { Mage } from './champions/Mage.js';
import { Archer } from './champions/Archer.js';

export class Player {
    constructor(championType = 'warrior', scene) {
        this.scene = scene;
        this.champion = this.createChampion(championType);
        this.score = 0;
        this.level = 1;
        this.experience = 0;
        this.isMoving = false;
        this.attackRange = 2;
        this.attackDamage = 25;
        this.attackCooldown = 1000; // 1 second
        this.lastAttackTime = 0;
    }

    createChampion(type) {
        switch (type.toLowerCase()) {
            case 'warrior':
                return new Warrior(this.scene);
            case 'mage':
                return new Mage(this.scene);
            case 'archer':
                return new Archer(this.scene);
            default:
                return new Warrior(this.scene);
        }
    }

    changeChampion(championType) {
        const oldPosition = this.champion.getPosition();
        this.champion = this.createChampion(championType);
        this.champion.setPosition(oldPosition.x, oldPosition.y, oldPosition.z);
        return this.champion;
    }

    setMoving(moving) {
        this.isMoving = moving;
        if (this.champion && this.champion.setMoving) {
            this.champion.setMoving(moving);
        }
    }

    getPosition() {
        return this.champion.getPosition();
    }

    setPosition(x, y, z) {
        this.champion.setPosition(x, y, z);
    }

    getMesh() {
        return this.champion.mesh;
    }

    update(delta) {
        if (this.champion && this.champion.update) {
            this.champion.update(delta);
        }
    }

    addExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.level * 100) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.experience = 0;
        // Add level up bonuses to champion
        this.champion.health += 10;
        this.champion.mana += 5;
        this.champion.attackDamage += 2;
    }

    attack(environment) {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) {
            return;
        }

        // Trigger champion attack animation
        this.champion.attack();

        const playerPosition = this.getPosition();

        // Check for destructibles in range
        environment.destructibles.forEach((destructible) => {
            const distance = playerPosition.distanceTo(destructible.position);
            if (distance <= this.attackRange) {
                destructible.userData.health -= this.attackDamage;
                this.lastAttackTime = now;

                // Visual feedback for hit
                this.createHitEffect(destructible.position);
            }
        });
    }

    createHitEffect(position) {
        // Create a simple hit effect
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.5
        });
        const hitEffect = new THREE.Mesh(geometry, material);
        hitEffect.position.copy(position);

        // Add to scene and remove after animation
        this.scene.add(hitEffect);
        setTimeout(() => {
            this.scene.remove(hitEffect);
        }, 200);
    }
}
