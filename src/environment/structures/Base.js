import * as THREE from 'three';
import { Destructible } from './Destructible.js';

export class Base extends Destructible {
    constructor(position, teamColor) {
        super(position);
        this.teamColor = teamColor;
        this.health = 1000; // Bases have the most health
        this.mesh.userData.type = 'base';
    }

    createMesh() {
        const group = new THREE.Group();

        // Create main structure
        const baseGeometry = new THREE.BoxGeometry(5, 4, 5);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: this.teamColor,
            shininess: 30
        });
        const baseStructure = new THREE.Mesh(baseGeometry, baseMaterial);
        baseStructure.position.y = 2;
        baseStructure.castShadow = true;
        baseStructure.receiveShadow = true;

        // Create decorative elements
        const towerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 8);
        const towerMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 40
        });

        // Add four corner towers
        const positions = [
            [-2, -2],
            [2, -2],
            [-2, 2],
            [2, 2]
        ];

        positions.forEach(([x, z]) => {
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.set(x, 3, z);
            tower.castShadow = true;
            tower.receiveShadow = true;
            group.add(tower);
        });

        // Add collision data
        const collisionGeometry = new THREE.BoxGeometry(5, 4, 5);
        const collisionMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        this.collisionMesh = new THREE.Mesh(
            collisionGeometry,
            collisionMaterial
        );
        this.collisionMesh.position.y = 2;

        // Set up targeting data
        group.userData.isDestructible = true;
        group.userData.health = this.health;
        group.userData.type = 'base';
        baseStructure.userData.isTargetable = true;
        baseStructure.userData.parentGroup = group;

        group.add(baseStructure);
        group.add(this.collisionMesh);

        return group;
    }

    destroy() {
        // Add game-ending logic here since base destruction should end the game
        const gameOverEvent = new CustomEvent('gameOver', {
            detail: {
                losingTeam: this.teamColor
            }
        });
        document.dispatchEvent(gameOverEvent);
    }
}
