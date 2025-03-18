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
        // Floating staff and glowing orb
        this.staff.position.y = 1.5 + Math.sin(this.movementTime) * 0.1;
        this.orb.position.y = 2.5 + Math.sin(this.movementTime) * 0.1;
        this.orb.material.emissiveIntensity =
            0.5 + Math.sin(this.movementTime) * 0.2;
    }

    resetAnimation() {
        this.staff.position.y = 1.5;
        this.orb.position.y = 2.5;
        this.orb.material.emissiveIntensity = 0.5;
    }
}
