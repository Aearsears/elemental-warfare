import * as THREE from 'three';

export class Tower {
    constructor(position, teamColor) {
        this.mesh = this.createTower(position, teamColor);
        this.health = 1000;
        this.team = teamColor;
        this.attackRange = 10;
        this.damage = 100;
    }

    createTower(position, teamColor) {
        const towerGroup = new THREE.Group();

        // Tower base
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 1, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            shininess: 60,
            specular: 0x444444
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;

        // Add crystal effect
        this.addCrystalEffect(towerGroup, teamColor);

        towerGroup.position.copy(position);
        return towerGroup;
    }

    addCrystalEffect(towerGroup, teamColor) {
        const crystalGeometry = new THREE.OctahedronGeometry(0.8);
        const crystalMaterial = new THREE.MeshPhongMaterial({
            color: teamColor,
            emissive: teamColor,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });

        this.crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        this.crystal.position.y = 8;
        towerGroup.add(this.crystal);
    }

    update(delta) {
        if (this.crystal) {
            this.crystal.rotation.y += delta;
            this.crystal.position.y = 8 + Math.sin(Date.now() * 0.002) * 0.2;
        }
    }
}
