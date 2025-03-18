import * as THREE from 'three';
import { HealthBar } from '../../ui/HealthBar.js';

export class Monster {
    constructor(config) {
        this.health = config.health || 100;
        this.damage = config.damage || 10;
        this.isAlive = true;
        this.mesh = this.createModel(config);
        this.mesh.userData.isTargetable = true;
        this.mesh.userData.type = 'monster';
        this.mesh.userData.parent = this;
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();

        // Add health bar
        this.healthBar = new HealthBar(this.health);
        this.healthBar.container.position.y = 1.5 * (config.scale || 1);
        this.mesh.add(this.healthBar.container);
    }

    createModel(config) {
        const monsterGroup = new THREE.Group();
        const scale = config.scale || 1;

        // Body (main body segment)
        const bodyGeometry = new THREE.SphereGeometry(0.5 * scale, 16, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: config.color || 0x00ff00,
            emissive: config.emissiveColor || config.color || 0x00ff00,
            emissiveIntensity: config.emissiveIntensity || 0.1,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5 * scale;
        monsterGroup.add(body);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1 * scale, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2 * scale, 0.6 * scale, 0.3 * scale);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2 * scale, 0.6 * scale, 0.3 * scale);
        monsterGroup.add(leftEye);
        monsterGroup.add(rightEye);

        // Spikes on back
        const spikeGeometry = new THREE.ConeGeometry(
            0.1 * scale,
            0.3 * scale,
            4
        );
        const spikeMaterial = new THREE.MeshPhongMaterial({
            color: config.color || 0x00ff00,
            shininess: 50
        });

        for (let i = 0; i < 5; i++) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(0, 0.7 * scale, -0.2 * scale + i * 0.1 * scale);
            spike.rotation.x = Math.PI / 3;
            monsterGroup.add(spike);
        }

        // Legs
        const legGeometry = new THREE.CylinderGeometry(
            0.05 * scale,
            0.05 * scale,
            0.4 * scale
        );
        const legMaterial = new THREE.MeshPhongMaterial({
            color: config.color || 0x00ff00,
            shininess: 30
        });

        const legPositions = [
            [-0.3, 0.2, 0.2],
            [0.3, 0.2, 0.2],
            [-0.3, 0.2, -0.2],
            [0.3, 0.2, -0.2]
        ];

        legPositions.forEach((pos) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos[0] * scale, pos[1] * scale, pos[2] * scale);
            monsterGroup.add(leg);
        });

        // Teeth (for buff monsters)
        if (config.type === 'buff') {
            const teethGeometry = new THREE.BoxGeometry(
                0.07 * scale,
                0.1 * scale,
                0.07 * scale
            );
            const teethMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 100
            });

            for (let i = -2; i <= 2; i++) {
                const tooth = new THREE.Mesh(teethGeometry, teethMaterial);
                tooth.position.set(i * 0.1 * scale, 0.4 * scale, 0.4 * scale);
                monsterGroup.add(tooth);
            }
        }

        // Add cast shadow to all parts
        monsterGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return monsterGroup;
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    checkCollision(otherBox) {
        this.updateBoundingBox();
        return this.boundingBox.intersectsBox(otherBox);
    }

    update(delta) {
        if (this.isAlive) {
            // Idle animation - body bobbing
            this.mesh.position.y = Math.sin(Date.now() * 0.002) * 0.1;

            // Leg movement
            this.mesh.children.forEach((child, index) => {
                if (index > 2) {
                    // Only animate legs
                    child.rotation.x =
                        Math.sin(Date.now() * 0.003 + index) * 0.2;
                }
            });

            // Update bounding box after movement
            this.updateBoundingBox();

            // Update health bar
            this.healthBar.update(this.health, window.camera);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0 && this.isAlive) {
            this.isAlive = false;
            this.mesh.remove(this.healthBar.container);
        }
    }
}
