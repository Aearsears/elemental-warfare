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

        // Tower base - made slightly wider and shorter
        const baseGeometry = new THREE.CylinderGeometry(1.4, 1.8, 0.8, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            shininess: 60,
            specular: 0x444444
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.4; // Lowered base position
        base.castShadow = true;
        base.receiveShadow = true;
        towerGroup.add(base);

        // Tower body - made shorter
        const bodyGeometry = new THREE.CylinderGeometry(1, 1.2, 4, 8); // Height reduced from 8 to 4
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x707070,
            shininess: 30,
            specular: 0x333333
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2.8; // Adjusted for new height
        body.castShadow = true;
        body.receiveShadow = true;
        towerGroup.add(body);

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
        this.crystal.position.y = 5; // Lowered crystal position from 8 to 5
        towerGroup.add(this.crystal);
    }

    update(delta) {
        if (this.crystal) {
            this.crystal.rotation.y += delta;
            this.crystal.position.y = 5 + Math.sin(Date.now() * 0.002) * 0.2; // Updated base height to match new position
        }
    }
}
