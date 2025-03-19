import * as THREE from 'three';
import { Base } from './structures/Base.js';
import { Tower } from './structures/Tower.js';
import { Water } from './Water.js';
import { JungleCamp } from './jungle/JungleCamp.js';
import { Lanes } from './terrain/Lanes.js';

export class Environment {
    constructor(scene, cssRenderer) {
        this.scene = scene;
        this.cssRenderer = cssRenderer; // Add CSS renderer reference
        this.structures = [];
        this.bases = [];
        this.towers = [];
        this.jungleCamps = [];
        this.trees = [];
        this.destructibles = [];
        this.monsters = []; // Add array to track monsters

        this.initializeEnvironment();

        // Listen for monster deaths
        document.addEventListener('monsterDeath', (event) => {
            const deadMonster = event.detail.monster;

            // Remove from parent (JungleCamp's monster group)
            if (deadMonster.mesh.parent) {
                deadMonster.mesh.parent.remove(deadMonster.mesh);
            }

            // Remove health bar
            deadMonster.mesh.remove(deadMonster.healthBar.container);

            // Dispose of geometries and materials
            deadMonster.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });

            // Remove from monsters array
            const index = this.monsters.indexOf(deadMonster);
            if (index > -1) {
                this.monsters.splice(index, 1);
            }

            // Check if all monsters in the camp are dead
            const camp = this.jungleCamps.find((camp) =>
                camp.monsterInstances.includes(deadMonster)
            );

            if (camp && camp.monsterInstances.every((m) => !m.isAlive)) {
                camp.startRespawnTimer();
            }
        });

        // Listen for destructible object destruction
        document.addEventListener('destructibleDestroyed', (event) => {
            const destructible = event.detail.destructibleGroup;

            if (destructible) {
                // Create destruction effect at the destructible's position
                const worldPosition = new THREE.Vector3();
                destructible.getWorldPosition(worldPosition);
                this.createDestructionEffect(worldPosition);

                // Remove from scene
                if (destructible.parent) {
                    destructible.parent.remove(destructible);
                }

                // Dispose of geometries and materials
                destructible.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                });

                // Remove from destructibles array
                const index = this.destructibles.indexOf(destructible);
                if (index > -1) {
                    this.destructibles.splice(index, 1);
                }
            }
        });
    }

    initializeEnvironment() {
        // Add bases
        this.createBases();

        // Add towers
        this.createTowers();

        this.createLanes();

        // Add river
        this.water = new Water();
        this.scene.add(this.water.mesh);

        // Add jungle camps
        this.addJungleCamps();

        this.createJungle();

        // Add destructible elements
        this.addDestructibles();
    }

    createBases() {
        const basePositions = [
            { pos: new THREE.Vector3(-22, 0, -22), color: 0x0044ff },
            { pos: new THREE.Vector3(22, 0, 22), color: 0xff0000 }
        ];

        basePositions.forEach((baseInfo) => {
            const base = new Base(baseInfo.pos, baseInfo.color);
            this.bases.push(base);
            this.scene.add(base.mesh);
        });
    }

    createLanes() {
        const lanes = new Lanes();
        lanes.getLanes().forEach((lane) => {
            this.scene.add(lane);
        });
    }

    createTowers() {
        const towerPositions = [
            { pos: new THREE.Vector3(-15, 0, -15), team: 0x0044ff },
            { pos: new THREE.Vector3(-15, 0, 0), team: 0x0044ff },
            { pos: new THREE.Vector3(0, 0, -15), team: 0x0044ff },
            { pos: new THREE.Vector3(15, 0, 15), team: 0xff0000 },
            { pos: new THREE.Vector3(15, 0, 0), team: 0xff0000 },
            { pos: new THREE.Vector3(0, 0, 15), team: 0xff0000 }
        ];

        towerPositions.forEach((towerInfo) => {
            const tower = new Tower(towerInfo.pos, towerInfo.team);
            this.towers.push(tower);
            this.scene.add(tower.mesh);
        });
    }

    addJungleCamps() {
        const campLocations = [
            // Moved camps away from tower positions
            // Red side jungle camps
            {
                pos: new THREE.Vector3(-15, 0, -10),
                type: 'buff'
            },
            {
                pos: new THREE.Vector3(-15, 0, 10),
                type: 'normal'
            },
            // Blue side jungle camps
            {
                pos: new THREE.Vector3(15, 0, -10),
                type: 'normal'
            },
            {
                pos: new THREE.Vector3(15, 0, 10),
                type: 'buff'
            },
            // Center jungle camps
            {
                pos: new THREE.Vector3(0, 0, -15),
                type: 'normal'
            },
            {
                pos: new THREE.Vector3(0, 0, 15),
                type: 'normal'
            }
        ];

        campLocations.forEach((camp) => {
            const jungleCamp = new JungleCamp(camp.pos, camp.type);
            this.jungleCamps.push(jungleCamp);
            this.scene.add(jungleCamp.mesh);
            this.scene.add(jungleCamp.monsters);
        });
    }

    createJungle() {
        // Create jungle camps and decorative elements
        const jungleCamps = [
            { x: -10, z: 5 },
            { x: 10, z: -5 },
            { x: 0, z: 10 },
            { x: 0, z: -10 }
        ];

        jungleCamps.forEach((camp) => {
            const radius = 3;
            const treeCount = 6;

            // Create circle of trees around camp
            for (let i = 0; i < treeCount; i++) {
                const angle = (i / treeCount) * Math.PI * 2;
                const x = camp.x + Math.cos(angle) * radius;
                const z = camp.z + Math.sin(angle) * radius;
                const tree = this.createTree(x, z);
                this.trees.push(tree);
                this.scene.add(tree);
            }
        });
    }

    createTree(x, z) {
        // Create tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4a2f21 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        trunk.receiveShadow = true;

        // Create tree leaves
        const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5a27 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 2;
        leaves.castShadow = true;
        leaves.receiveShadow = true;

        // Group trunk and leaves
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        // Position the tree
        tree.position.set(x, 0, z);
        return tree;
    }

    addDestructibles() {
        const destructiblePositions = [
            new THREE.Vector3(-10, 0, 0),
            new THREE.Vector3(10, 0, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(0, 0, -10)
        ];

        destructiblePositions.forEach((position) => {
            const destructible = this.createDestructible(position);
            this.destructibles.push(destructible);
            this.scene.add(destructible);
        });
    }

    createDestructible(position) {
        const group = new THREE.Group();

        // Create barrel/crate
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 30,
            specular: 0x444444
        });

        const barrel = new THREE.Mesh(geometry, material);
        barrel.castShadow = true;
        barrel.receiveShadow = true;

        // Mark both the group and the mesh as targetable
        group.userData.isDestructible = true;
        group.userData.health = 100;
        barrel.userData.isTargetable = true;
        barrel.userData.isDestructible = true;
        barrel.userData.parentGroup = group;

        group.add(barrel);
        group.position.copy(position);
        group.position.y = 0.5;

        return group;
    }

    update(delta) {
        // Update all environmental elements
        this.towers.forEach((tower) => tower.update(delta));
        this.structures.forEach((structure) => structure.update(delta));
        this.jungleCamps.forEach((camp) => camp.update(delta));
        if (this.water.update) this.water.update(delta);

        // Update destructibles if needed
        this.destructibles.forEach((destructible) => {
            if (destructible.userData.health <= 0) {
                this.scene.remove(destructible);
                this.destructibles = this.destructibles.filter(
                    (d) => d !== destructible
                );
            }
        });
    }

    getTargetableObjects() {
        return [
            ...this.destructibles,
            ...this.jungleCamps.flatMap((camp) =>
                camp.monsterInstances
                    .filter((monster) => monster.isAlive)
                    .map((monster) => monster.mesh)
            )
        ];
    }

    createDestructionEffect(position) {
        // Create particle burst effect for destruction
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.2, 0.2),
                new THREE.MeshPhongMaterial({
                    color: 0x8b4513,
                    emissive: 0x3d2008,
                    emissiveIntensity: 0.5
                })
            );

            particle.position.copy(position);

            // Random direction for particle
            const angle = ((Math.PI * 2) / particleCount) * i;
            const speed = 2 + Math.random() * 3;
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                4 + Math.random() * 2,
                Math.sin(angle) * speed
            );

            this.scene.add(particle);

            // Animate particle
            let elapsed = 0;
            const animate = () => {
                elapsed += 0.016;

                // Update position
                particle.position.x += particle.velocity.x * 0.016;
                particle.position.y += particle.velocity.y * 0.016;
                particle.position.z += particle.velocity.z * 0.016;

                // Apply gravity
                particle.velocity.y -= 9.8 * 0.016;

                // Rotate particle
                particle.rotation.x += 0.1;
                particle.rotation.y += 0.1;

                // Fade out
                particle.material.opacity = Math.max(0, 1 - elapsed);
                particle.scale.multiplyScalar(0.97);

                if (elapsed < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                }
            };

            animate();
        }
    }
}
