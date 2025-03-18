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
            config.geometry || new THREE.TetrahedronGeometry(0.5);
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

        // Add eyes
        this.addEyes(monsterGroup, config.scale || 1);

        return monsterGroup;
    }

    addEyes(group, scale) {
        const eyeGeometry = new THREE.SphereGeometry(0.1 * scale, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });

        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);

        eye1.position.set(0.2 * scale, 0.2 * scale, 0.2 * scale);
        eye2.position.set(-0.2 * scale, 0.2 * scale, 0.2 * scale);

        group.add(eye1);
        group.add(eye2);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0 && this.isAlive) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        // Trigger death animation or particle effects here
    }

    update(delta) {
        if (this.isAlive) {
            // Basic idle animation
            this.mesh.rotation.y += delta;
            this.mesh.position.y = Math.sin(Date.now() * 0.002) * 0.1;
        }
    }
}
