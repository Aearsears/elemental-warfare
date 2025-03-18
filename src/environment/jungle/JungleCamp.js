import * as THREE from 'three';

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
        // Add a larger, more detailed monster for buff camps
        const bodyGeometry = new THREE.IcosahedronGeometry(1);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.2
        });

        const monster = new THREE.Mesh(bodyGeometry, bodyMaterial);
        monster.position.y = 1;
        group.add(monster);
    }

    addNormalMonsters(group) {
        // Create 3 smaller monsters for normal camps
        const colors = [0x00ff00, 0x00dd00, 0x00bb00]; // Different shades of green
        const positions = [
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 1)
        ];

        positions.forEach((pos, index) => {
            // Create monster body
            const bodyGeometry = new THREE.TetrahedronGeometry(0.5);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: colors[index],
                emissive: colors[index],
                emissiveIntensity: 0.1,
                shininess: 30
            });

            const monster = new THREE.Mesh(bodyGeometry, bodyMaterial);
            monster.position.copy(pos);
            monster.position.y = 0.5;
            monster.castShadow = true;
            monster.receiveShadow = true;

            // Add eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const eyeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0xffff00,
                emissiveIntensity: 0.5
            });

            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);

            eye1.position.set(0.2, 0.2, 0.2);
            eye2.position.set(-0.2, 0.2, 0.2);

            monster.add(eye1);
            monster.add(eye2);
            group.add(monster);
        });
    }

    update(delta) {
        if (this.isActive) {
            // Animate monsters
            this.monsters.children.forEach((monster) => {
                monster.rotation.y += delta;
                monster.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.1;
            });
        }
    }
}
