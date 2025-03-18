import * as THREE from 'three';
import { Monster } from './Monster.js';

export class JungleCamp {
    constructor(position, type) {
        this.position = position;
        this.type = type;
        this.mesh = this.createCamp();
        this.monsters = this.createMonsters();
        this.respawnTime = 60; // seconds
        this.isActive = true;
    }

    createCamp() {
        const campGroup = new THREE.Group();

        // Add camp marker
        const markerGeometry = new THREE.CircleGeometry(2, 32);
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3
        });

        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.rotation.x = -Math.PI / 2;
        marker.position.y = 0.1;
        campGroup.add(marker);

        campGroup.position.copy(this.position);
        return campGroup;
    }

    createMonsters() {
        const monsterGroup = new THREE.Group();

        // Create different monsters based on camp type
        switch (this.type) {
            case 'buff':
                this.addBuffMonster(monsterGroup);
                break;
            case 'normal':
                this.addNormalMonsters(monsterGroup);
                break;
        }

        return monsterGroup;
    }

    addBuffMonster(group) {
        const buffMonster = new Monster({
            health: 200,
            damage: 20,
            geometry: new THREE.IcosahedronGeometry(1),
            color: 0xff0000,
            emissiveColor: 0xff0000,
            emissiveIntensity: 0.2,
            scale: 2
        });

        buffMonster.mesh.position.y = 1;
        group.add(buffMonster.mesh);
        this.monsterInstances = [buffMonster];
    }

    addNormalMonsters(group) {
        const colors = [0x00ff00, 0x00dd00, 0x00bb00];
        const positions = [
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 1)
        ];

        this.monsterInstances = positions.map((pos, index) => {
            const monster = new Monster({
                health: 100,
                damage: 10,
                color: colors[index],
                emissiveColor: colors[index],
                scale: 1
            });

            monster.mesh.position.copy(pos);
            monster.mesh.position.y = 0.5;
            group.add(monster.mesh);
            return monster;
        });
    }

    update(delta) {
        if (this.isActive && this.monsterInstances) {
            this.monsterInstances.forEach((monster) => {
                if (monster.isAlive) {
                    monster.update(delta);
                }
            });
        }
    }
}
