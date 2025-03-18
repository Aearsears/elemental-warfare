import { Champion } from './Champion.js';
import * as THREE from 'three';

export class Warrior extends Champion {
    constructor() {
        super({
            health: 150,
            mana: 50,
            speed: 0.15,
            attackDamage: 15,
            attackRange: 2
        });
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.attackDuration = 0.5; // seconds
    }

    createModel() {
        const warriorGroup = new THREE.Group();

        // Body - bulkier than base model
        const bodyGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.9);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1;
        this.body.castShadow = true;
        warriorGroup.add(this.body);

        // Armor plates
        const armorGeometry = new THREE.BoxGeometry(1.4, 0.4, 1);
        const armorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const chestArmor = new THREE.Mesh(armorGeometry, armorMaterial);
        chestArmor.position.y = 1.2;
        warriorGroup.add(chestArmor);

        // Sword
        const swordGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const swordMaterial = new THREE.MeshPhongMaterial({ color: 0xc0c0c0 });
        this.sword = new THREE.Mesh(swordGeometry, swordMaterial);
        this.sword.position.set(0.8, 1.5, 0);
        warriorGroup.add(this.sword);

        return warriorGroup;
    }

    updateAnimation(delta) {
        if (this.isAttacking) {
            // Attack animation
            this.attackAnimationTime += delta;
            // Full 360-degree swing
            this.sword.rotation.z =
                Math.PI * 2 * (this.attackAnimationTime / this.attackDuration);

            if (this.attackAnimationTime >= this.attackDuration) {
                this.isAttacking = false;
                this.attackAnimationTime = 0;
                this.sword.rotation.z = 0;
            }
        } else if (this.isMoving) {
            // Walking animation
            this.movementTime += delta * 5;
            this.sword.rotation.z = Math.sin(this.movementTime) * 0.3;
        } else {
            this.resetAnimation();
        }
    }

    attack() {
        this.isAttacking = true;
        this.attackAnimationTime = 0;
    }

    resetAnimation() {
        this.sword.rotation.z = 0;
    }
}
