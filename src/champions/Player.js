import * as THREE from 'three';
import { Warrior } from './Warrior.js';
import { Mage } from './Mage.js';
import { Archer } from './Archer.js';

export class Player {
    constructor(championType = 'warrior', scene, environment) {
        this.scene = scene;
        this.champion = this.createChampion(championType, environment);
        this.score = 0;
        this.level = 1;
        this.experience = 0;
        this.isMoving = false;
    }

    createChampion(type, environment) {
        switch (type.toLowerCase()) {
            case 'warrior':
                return new Warrior(this.scene, environment);
            case 'mage':
                return new Mage(this.scene, environment);
            case 'archer':
                return new Archer(this.scene, environment);
            default:
                return new Warrior(this.scene, environment);
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

    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) {
            return;
        }

        // Trigger champion attack animation
        this.champion.attack();
    }
}
