import * as THREE from 'three';
import { Base } from './structures/Base.js';
import { Tower } from './structures/Tower.js';
import { Water } from './Water.js';
import { JungleCamp } from './jungle/JungleCamp.js';
import { Lanes } from './terrain/Lanes.js';
import { DestructionEffect } from '../effects/DestructionEffect.js';
import { Destructible } from './structures/Destructible.js';
import { Tree } from './structures/Tree.js';
import { Barrel } from './structures/Barrel.js';
import { EnvironmentCleanup } from './cleanup/EnvironmentCleanup.js';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.structures = [];
        this.bases = [];
        this.towers = [];
        this.jungleCamps = [];
        this.trees = []; // Store Tree instances, not just meshes
        this.destructibles = [];
        this.monsters = []; // Add array to track monsters
        this.destructionEffect = new DestructionEffect(scene);

        this.cleanup = new EnvironmentCleanup(scene, this);
        this.initializeEnvironment();
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
            // Red side jungle camps (left side)
            {
                pos: new THREE.Vector3(-20, 0, -10), // Moved further from top tower
                type: 'buff'
            },
            {
                pos: new THREE.Vector3(-20, 0, 10), // Moved further from bottom tower
                type: 'normal'
            },

            // Blue side jungle camps (right side)
            {
                pos: new THREE.Vector3(20, 0, -10), // Moved further from top tower
                type: 'normal'
            },
            {
                pos: new THREE.Vector3(20, 0, 10), // Moved further from bottom tower
                type: 'buff'
            },

            // Center jungle camps
            {
                pos: new THREE.Vector3(0, 0, -25), // Moved further from center
                type: 'normal'
            },
            {
                pos: new THREE.Vector3(0, 0, 25), // Moved further from center
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
        // Define jungle camp areas
        const jungleCamps = [
            { x: -10, z: 5 },
            { x: 10, z: -5 },
            { x: 0, z: 10 },
            { x: 0, z: -10 }
        ];

        jungleCamps.forEach((camp) => {
            const areaRadius = 5;
            const treesPerArea = 8;
            const minTreeDistance = 1.5;

            for (let i = 0; i < treesPerArea; i++) {
                let attempts = 0;
                const maxAttempts = 20;

                while (attempts < maxAttempts) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * areaRadius;
                    const x = camp.x + Math.cos(angle) * radius;
                    const z = camp.z + Math.sin(angle) * radius;

                    const isTooClose = this.trees.some((tree) => {
                        const dx = tree.mesh.position.x - x;
                        const dz = tree.mesh.position.z - z;
                        return Math.sqrt(dx * dx + dz * dz) < minTreeDistance;
                    });

                    if (!isTooClose) {
                        const tree = new Tree(new THREE.Vector3(x, 0, z));
                        this.trees.push(tree); // Store the Tree instance
                        this.scene.add(tree.mesh);
                        break;
                    }

                    attempts++;
                }
            }
        });
    }

    addDestructibles() {
        const destructiblePositions = [
            new THREE.Vector3(-10, 0, 0),
            new THREE.Vector3(10, 0, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(0, 0, -10)
        ];

        destructiblePositions.forEach((position) => {
            const destructible = new Barrel(position);
            this.destructibles.push(destructible);
            this.scene.add(destructible.mesh);
        });
    }

    update(delta) {
        // Update all environmental elements
        this.towers.forEach((tower) => tower.update(delta));
        this.structures.forEach((structure) => structure.update(delta));
        this.jungleCamps.forEach((camp) => camp.update(delta));
        if (this.water.update) this.water.update(delta);

        // Clean up dead entities
        this.cleanup.cleanupDeadMonsters();

        // Update remaining monsters
        this.jungleCamps.forEach((camp) => {
            camp.monsterInstances.forEach((monster) => {
                if (monster.update) monster.update(delta);
            });
        });
    }

    getTargetableObjects() {
        const targetableObjects = [
            ...this.destructibles.map((d) => d.mesh),
            ...this.jungleCamps
                .flatMap((camp) =>
                    camp.monsterInstances
                        .filter((monster) => monster.isAlive && monster.mesh)
                        .map((monster) => monster.mesh)
                )
                .filter(Boolean)
        ];

        return targetableObjects;
    }
}
