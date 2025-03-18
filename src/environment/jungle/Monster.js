import * as THREE from 'three';

export class Monster {
    constructor(config) {
        this.health = config.health || 100;
        this.damage = config.damage || 10;
        this.isAlive = true;
        this.mesh = this.createModel(config);
        this.mesh.userData.isTargetable = true;
        this.mesh.userData.type = 'monster';
        this.mesh.userData.parent = this;
    }

    createModel(config) {
        const monsterGroup = new THREE.Group();

        // Base monster body
        const bodyGeometry =
            config.geometry ||
            new THREE.TetrahedronGeometry(config.scale || 0.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: config.color || 0x00ff00,
            emissive: config.emissiveColor || config.color || 0x00ff00,
            emissiveIntensity: config.emissiveIntensity || 0.1,
            shininess: 30
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        monsterGroup.add(body);

        return monsterGroup;
    }

    update(delta) {
        if (this.isAlive) {
            // Idle animation
            this.mesh.rotation.y += delta;
            this.mesh.position.y += Math.sin(Date.now() * 0.002) * 0.001;
        }
    }
}
