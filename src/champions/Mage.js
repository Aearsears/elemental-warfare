import { Champion } from './Champion.js';
import * as THREE from 'three';

export class Mage extends Champion {
    constructor() {
        super({
            health: 80,
            mana: 150,
            speed: 0.18,
            attackDamage: 8,
            attackRange: 8
        });
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.attackDuration = 0.8; // seconds
    }

    createModel() {
        const mageGroup = new THREE.Group();

        // Robe body
        const bodyGeometry = new THREE.ConeGeometry(0.6, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4b0082 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1;
        this.body.castShadow = true;
        mageGroup.add(this.body);

        // Staff
        const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
        const staffMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        this.staff = new THREE.Mesh(staffGeometry, staffMaterial);
        this.staff.position.set(0.5, 1.5, 0);
        mageGroup.add(this.staff);

        // Staff orb
        const orbGeometry = new THREE.SphereGeometry(0.15);
        const orbMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        this.orb = new THREE.Mesh(orbGeometry, orbMaterial);
        this.orb.position.set(0.5, 2.5, 0);
        mageGroup.add(this.orb);

        return mageGroup;
    }

    updateAnimation(delta) {
        if (this.isAttacking) {
            // Attack animation
            this.attackAnimationTime += delta;

            // Staff raising and orb glowing animation
            const progress = this.attackAnimationTime / this.attackDuration;
            this.staff.rotation.z = Math.sin(progress * Math.PI) * 0.5;
            this.orb.material.emissiveIntensity =
                0.5 + Math.sin(progress * Math.PI * 2) * 1.5;

            if (this.attackAnimationTime >= this.attackDuration) {
                this.isAttacking = false;
                this.attackAnimationTime = 0;
                this.staff.rotation.z = 0;
                this.orb.material.emissiveIntensity = 0.5;
            }
        } else if (this.isMoving) {
            // Walking animation
            this.movementTime += delta * 5;
            this.staff.position.y = 1.5 + Math.sin(this.movementTime) * 0.1;
            this.orb.position.y = 2.5 + Math.sin(this.movementTime) * 0.1;
        }
    }

    resetAnimation() {
        this.staff.position.y = 1.5;
        this.orb.position.y = 2.5;
        this.orb.material.emissiveIntensity = 0.5;
    }

    attack() {
        this.isAttacking = true;
        this.attackAnimationTime = 0;
    }
}
