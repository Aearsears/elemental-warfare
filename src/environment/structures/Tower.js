import * as THREE from 'three';
import { Destructible } from './Destructible.js';

export class Tower extends Destructible {
    constructor(position, teamColor) {
        super(position);
        this.teamColor = teamColor;
        this.health = 500; // Towers have more health than regular destructibles
        this.crystals = []; // Move initialization after super()
        this.mesh.userData.type = 'tower';
        this.addFloatingCrystals(); // Add crystals after mesh is created
    }

    createMesh() {
        const group = new THREE.Group();

        // Create base
        const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 1, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            shininess: 30
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;

        // Create tower body
        const towerGeometry = new THREE.CylinderGeometry(1.5, 2, 6, 8);
        const towerMaterial = new THREE.MeshPhongMaterial({
            color: this.teamColor,
            shininess: 30
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 3.5;
        tower.castShadow = true;
        tower.receiveShadow = true;

        // Add collision data
        const collisionGeometry = new THREE.CylinderGeometry(2, 2.5, 7, 8);
        const collisionMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        this.collisionMesh = new THREE.Mesh(
            collisionGeometry,
            collisionMaterial
        );
        this.collisionMesh.position.y = 3;

        // Set up targeting data
        group.userData.isDestructible = true;
        group.userData.health = this.health;
        group.userData.type = 'tower';
        tower.userData.isTargetable = true;
        tower.userData.parentGroup = group;

        group.add(base);
        group.add(tower);
        group.add(this.collisionMesh);

        return group;
    }

    addFloatingCrystals() {
        // Add floating crystals
        const crystalCount = 3;
        for (let i = 0; i < crystalCount; i++) {
            const crystal = this.createCrystal();
            crystal.position.y = 7; // Position above tower
            this.crystals.push(crystal);
            this.mesh.add(crystal);
        }
    }

    createCrystal() {
        const crystalGeometry = new THREE.OctahedronGeometry(0.3);
        const crystalMaterial = new THREE.MeshPhongMaterial({
            color: this.teamColor,
            emissive: this.teamColor,
            emissiveIntensity: 0.5,
            shininess: 90,
            transparent: true,
            opacity: 0.8
        });

        return new THREE.Mesh(crystalGeometry, crystalMaterial);
    }

    update(delta) {
        // Update crystal rotations
        const time = Date.now() * 0.001;
        this.crystals.forEach((crystal, index) => {
            const angle = time + index * ((Math.PI * 2) / this.crystals.length);
            const radius = 1;

            crystal.position.x = Math.cos(angle) * radius;
            crystal.position.z = Math.sin(angle) * radius;
            crystal.rotation.y += delta;
            crystal.rotation.x += delta * 0.5;
        });
    }

    destroy() {
        super.destroy();
        // Create crystal shatter effect
        this.createShatterEffect();
    }

    createShatterEffect() {
        const shardCount = 15;
        const shards = [];

        for (let i = 0; i < shardCount; i++) {
            const shard = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.2),
                new THREE.MeshPhongMaterial({
                    color: new THREE.Color(this.teamColor),
                    emissive: new THREE.Color(this.teamColor),
                    emissiveIntensity: 0.5,
                    shininess: 90
                })
            );

            shard.position.copy(this.mesh.position);
            shard.position.y += 7; // Start at crystal height

            // Random explosion velocity
            shard.velocity = new THREE.Vector3(
                Math.random() * 4 - 2,
                Math.random() * 4 + 2,
                Math.random() * 4 - 2
            );

            shards.push(shard);
            this.mesh.parent.add(shard);

            // Animate and remove shards
            const animate = () => {
                shard.position.add(shard.velocity);
                shard.velocity.y -= 0.1; // Add gravity
                shard.rotation.x += 0.1;
                shard.rotation.y += 0.1;
            };

            // Add to animation system
            const animationId = setInterval(animate, 16);

            // Cleanup after 2 seconds
            setTimeout(() => {
                clearInterval(animationId);
                if (shard.parent) {
                    shard.parent.remove(shard);
                    shard.geometry.dispose();
                    shard.material.dispose();
                }
            }, 2000);
        }
    }
}
