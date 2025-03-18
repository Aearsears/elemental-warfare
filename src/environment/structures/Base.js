import * as THREE from 'three';

export class Base {
    constructor(position, teamColor) {
        this.mesh = this.createBase(position, teamColor);
        this.health = 5000;
        this.team = teamColor;
    }

    createBase(position, teamColor) {
        const baseGroup = new THREE.Group();

        // Main structure
        const baseGeometry = new THREE.CylinderGeometry(5, 6, 4, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: teamColor,
            shininess: 60,
            specular: 0x444444
        });
        const baseStructure = new THREE.Mesh(baseGeometry, baseMaterial);
        baseStructure.position.y = 2;
        baseStructure.castShadow = true;
        baseStructure.receiveShadow = true;

        // Add defensive wall segments
        this.addWalls(baseGroup, teamColor);

        // Add spawn point marker
        this.addSpawnPoint(baseGroup, teamColor);

        baseGroup.position.copy(position);
        return baseGroup;
    }

    addWalls(baseGroup, teamColor) {
        const wallGeometry = new THREE.BoxGeometry(2, 3, 12);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: teamColor,
            shininess: 60,
            specular: 0x444444
        });

        // Add walls in a defensive formation
        for (let i = 0; i < 4; i++) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.y = 1.5;
            wall.rotation.y = (Math.PI / 2) * i;
            wall.position.x = Math.cos(wall.rotation.y) * 8;
            wall.position.z = Math.sin(wall.rotation.y) * 8;
            wall.castShadow = true;
            wall.receiveShadow = true;
            baseGroup.add(wall);
        }
    }

    addSpawnPoint(baseGroup, teamColor) {
        const spawnGeometry = new THREE.CircleGeometry(3, 32);
        const spawnMaterial = new THREE.MeshPhongMaterial({
            color: teamColor,
            transparent: true,
            opacity: 0.3,
            emissive: teamColor,
            emissiveIntensity: 0.5
        });

        const spawnPoint = new THREE.Mesh(spawnGeometry, spawnMaterial);
        spawnPoint.rotation.x = -Math.PI / 2;
        spawnPoint.position.y = 0.1;
        baseGroup.add(spawnPoint);
    }
}
