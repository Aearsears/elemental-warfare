import * as THREE from 'three';
import { Monster } from './Monster.js';

export class JungleCamp {
    constructor(position, type) {
        this.position = position;
        this.type = type;
        this.mesh = this.createCamp();
        this.monsterInstances = [];
        this.monsters = new THREE.Group();
        this.monsters.position.copy(position); // Position monster group at camp location
        this.createMonsters();
        this.respawnTime = 60; // 60 seconds respawn timer
        this.respawnTimer = 0;
        this.isRespawning = false;
        this.isActive = true;
        this.respawnText = null;
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
        // Create different monsters based on camp type
        switch (this.type) {
            case 'buff':
                this.addBuffMonster();
                break;
            case 'normal':
                this.addNormalMonsters();
                break;
        }
    }

    addBuffMonster() {
        const buffMonster = new Monster({
            health: 200,
            damage: 20,
            geometry: new THREE.IcosahedronGeometry(1),
            color: 0xff0000,
            emissiveColor: 0xff0000,
            emissiveIntensity: 0.2,
            scale: 2,
            position: new THREE.Vector3(0, 0, 0) // Center position relative to camp
        });

        buffMonster.mesh.position.y = 1; // Height above ground
        this.monsters.add(buffMonster.mesh);
        this.monsterInstances = [buffMonster];
        this.mesh.add(this.monsters); // Add monster group to camp mesh
    }

    addNormalMonsters() {
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
                scale: 1,
                position: this.position
            });

            monster.mesh.position.copy(pos);
            monster.mesh.position.y = 0.5;
            this.monsters.add(monster.mesh);
            return monster;
        });
    }

    update(delta) {
        if (this.isActive) {
            // Update alive monsters
            this.monsterInstances.forEach((monster) => {
                if (monster.isAlive) {
                    monster.update(delta);
                }
            });

            // Handle respawning
            if (this.isRespawning && this.respawnText) {
                this.respawnTimer -= delta;

                // Update progress ring
                const progress = this.respawnTimer / this.respawnTime;
                const ring = this.respawnText.children[1];
                ring.scale.set(progress, progress, 1);

                // Update number display
                const numberMesh = this.respawnText.children[2];
                const newGeometry = this.createNumberGeometry(
                    Math.ceil(this.respawnTimer)
                );
                numberMesh.geometry.dispose();
                numberMesh.geometry = newGeometry;

                // Make timer face camera
                if (window.camera) {
                    const camPos = window.camera.position.clone();
                    camPos.y = this.respawnText.position.y;
                    this.respawnText.lookAt(camPos);
                    this.respawnText.rotation.x = -Math.PI / 2;
                }

                if (this.respawnTimer <= 0) {
                    this.respawnMonsters();
                    this.isRespawning = false;
                    this.mesh.remove(this.respawnText);
                    this.respawnText = null;
                }
            }
            // Check if all monsters are dead
            else if (
                this.monsterInstances.every((monster) => !monster.isAlive)
            ) {
                this.startRespawnTimer();
            }
        }
    }

    startRespawnTimer() {
        this.isRespawning = true;
        this.respawnTimer = this.respawnTime;
        this.createRespawnText();
    }

    respawnMonsters() {
        // Clear old monster instances
        this.monsterInstances.forEach((monster) => {
            if (monster.mesh.parent) {
                monster.mesh.parent.remove(monster.mesh);
            }
        });

        this.monsterInstances = [];
        this.monsters.clear();

        // Create new monsters based on camp type
        this.createMonsters();
    }

    createRespawnText() {
        // Remove old timer if it exists
        if (this.respawnText) {
            this.mesh.remove(this.respawnText);
        }

        this.respawnText = new THREE.Group();

        // Create circle background
        const circleGeometry = new THREE.CircleGeometry(1.5, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        const circle = new THREE.Mesh(circleGeometry, circleMaterial);

        // Create ring for progress indicator
        const ringGeometry = new THREE.RingGeometry(1.4, 1.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.z = 0.01;

        // Create number display using shapes
        const numberGeometry = this.createNumberGeometry(
            Math.ceil(this.respawnTimer)
        );
        const numberMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });

        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        numberMesh.scale.set(0.5, 0.5, 1);
        numberMesh.position.z = 0.02;

        // Add all meshes to group
        this.respawnText.add(circle);
        this.respawnText.add(ring);
        this.respawnText.add(numberMesh);

        // Position and rotate timer
        this.respawnText.position.y = 3;
        this.respawnText.rotation.x = -Math.PI / 2;

        this.mesh.add(this.respawnText);
    }

    createNumberGeometry(number) {
        const shapes = [];
        const numberStr = number.toString();
        let xOffset = 0;

        for (let i = 0; i < numberStr.length; i++) {
            const digit = parseInt(numberStr[i]);
            const shape = new THREE.Shape();

            switch (digit) {
                case 0:
                    shape.moveTo(xOffset + 0, 0);
                    shape.lineTo(xOffset + 0.6, 0);
                    shape.lineTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0, 0);
                    break;
                case 1:
                    shape.moveTo(xOffset + 0.3, 0);
                    shape.lineTo(xOffset + 0.3, 1);
                    break;
                case 2:
                    shape.moveTo(xOffset + 0, 0);
                    shape.lineTo(xOffset + 0.6, 0);
                    shape.lineTo(xOffset + 0.6, 0.5);
                    shape.lineTo(xOffset + 0, 0.5);
                    shape.lineTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0.6, 1);
                    break;
                case 3:
                    shape.moveTo(xOffset + 0, 0);
                    shape.lineTo(xOffset + 0.6, 0);
                    shape.lineTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0, 1);
                    shape.moveTo(xOffset + 0, 0.5);
                    shape.lineTo(xOffset + 0.6, 0.5);
                    break;
                case 4:
                    shape.moveTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0, 0.5);
                    shape.lineTo(xOffset + 0.6, 0.5);
                    shape.moveTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0.6, 0);
                    break;
                case 5:
                    shape.moveTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0, 0.5);
                    shape.lineTo(xOffset + 0.6, 0.5);
                    shape.lineTo(xOffset + 0.6, 0);
                    shape.lineTo(xOffset + 0, 0);
                    break;
                case 6:
                    shape.moveTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0, 0);
                    shape.lineTo(xOffset + 0.6, 0);
                    shape.lineTo(xOffset + 0.6, 0.5);
                    shape.lineTo(xOffset + 0, 0.5);
                    break;
                case 7:
                    shape.moveTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0.6, 0);
                    break;
                case 8:
                    shape.moveTo(xOffset + 0, 0);
                    shape.lineTo(xOffset + 0.6, 0);
                    shape.lineTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0, 0);
                    shape.moveTo(xOffset + 0, 0.5);
                    shape.lineTo(xOffset + 0.6, 0.5);
                    break;
                case 9:
                    shape.moveTo(xOffset + 0.6, 0);
                    shape.lineTo(xOffset + 0.6, 1);
                    shape.lineTo(xOffset + 0, 1);
                    shape.lineTo(xOffset + 0, 0.5);
                    shape.lineTo(xOffset + 0.6, 0.5);
                    break;
            }
            shapes.push(shape);
            xOffset += 0.8; // Space between numbers
        }

        const geometry = new THREE.ShapeGeometry(shapes);
        geometry.center();
        return geometry;
    }

    createRespawnIndicator() {
        // Create HTML element for the timer
        const element = document.createElement('div');
        element.style.color = 'white';
        element.style.fontSize = '16px';
        element.style.padding = '5px';
        element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        element.style.borderRadius = '3px';
        element.textContent = `Respawning in ${this.respawnTime}s`;

        // Create CSS2DObject for the timer
        const indicator = new THREE.CSS2DObject(element);
        indicator.position.set(0, 3, 0); // Position above camp
        return indicator;
    }
}
