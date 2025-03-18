import * as THREE from 'three';
import { Warrior } from './champions/Warrior.js';
import { Mage } from './champions/Mage.js';
import { Archer } from './champions/Archer.js';

export class Player {
    constructor(championType = 'warrior') {
        this.champion = this.createChampion(championType);
        this.score = 0;
        this.level = 1;
        this.experience = 0;
        this.isMoving = false;
    }

    createChampion(type) {
        switch (type.toLowerCase()) {
            case 'warrior':
                return new Warrior();
            case 'mage':
                return new Mage();
            case 'archer':
                return new Archer();
            default:
                return new Warrior();
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
}
