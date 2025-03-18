import { Champion } from './Champion.js';
import * as THREE from 'three';

export class Archer extends Champion {
    constructor() {
        super({
            health: 90,
            mana: 70,
            speed: 0.22,
            attackDamage: 12,
            attackRange: 6
        });
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.attackDuration = 0.6; // seconds
    }

    createModel() {
        const archerGroup = new THREE.Group();

        // Slender body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.6);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2f4f4f });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1;
        this.body.castShadow = true;
        archerGroup.add(this.body);

        // Bow
        const bowGeometry = new THREE.TorusGeometry(0.5, 0.05, 8, 16, Math.PI);
        const bowMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        this.bow = new THREE.Mesh(bowGeometry, bowMaterial);
        this.bow.position.set(0.6, 1.5, 0);
        this.bow.rotation.z = Math.PI / 2;
        archerGroup.add(this.bow);

        // Quiver
        const quiverGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
        const quiverMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const quiver = new THREE.Mesh(quiverGeometry, quiverMaterial);
        quiver.position.set(-0.3, 1.3, -0.2);
        quiver.rotation.x = Math.PI / 6;
        archerGroup.add(quiver);

        return archerGroup;
    }

    updateAnimation(delta) {
        if (this.isAttacking) {
            // Attack animation
            this.attackAnimationTime += delta;
            const progress = this.attackAnimationTime / this.attackDuration;

            // Bow drawing and release animation
            if (progress < 0.5) {
                // Drawing bow
                this.bow.scale.y = 1 - progress * 0.3;
            } else {
                // Release and reset
                this.bow.scale.y = 0.85 + (progress - 0.5) * 0.3;
            }

            if (this.attackAnimationTime >= this.attackDuration) {
                this.isAttacking = false;
                this.attackAnimationTime = 0;
                this.bow.scale.y = 1;
            }
        } else if (this.isMoving) {
            // Walking animation
            this.movementTime += delta * 5;
            this.bow.position.y = 1.5 + Math.sin(this.movementTime) * 0.1;
        }
    }

    attack() {
        this.isAttacking = true;
        this.attackAnimationTime = 0;
    }

    resetAnimation() {
        this.bow.scale.y = 1;
    }
}
