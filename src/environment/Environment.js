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
        // this.createBases();

        // Add towers
        // this.createTowers();

        // this.createLanes();

        // Add river
        // this.water = new Water();
        // this.scene.add(this.water.mesh);

        // Add jungle camps
        this.addJungleCamps();

        this.createJungle();

        // Add destructible elements
        this.addDestructibles();
    }

    createBases() {
        const basePositions = [
            { pos: new THREE.Vector3(-40, 0, -40), color: 0x0044ff },
            { pos: new THREE.Vector3(40, 0, 40), color: 0xff0000 }
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
        // Define jungle camp areas in a circular pattern
        const campCount = 8;
        const campRadius = 30; // Adjusted for larger map

        for (let i = 0; i < campCount; i++) {
            const angle = (i * 2 * Math.PI) / campCount;
            const x = campRadius * Math.cos(angle);
            const z = campRadius * Math.sin(angle);

            // Alternate between buff and normal camps
            const campType = i % 2 === 0 ? 'buff' : 'normal';

            const camp = new JungleCamp({
                position: new THREE.Vector3(x, 0, z),
                type: campType
            });

            this.jungleCamps.push(camp);
            this.scene.add(camp.mesh);
        }
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
        // if (this.water.update) this.water.update(delta);

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
