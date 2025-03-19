import * as THREE from 'three';

export class AbilityHitDetection {
    constructor(scene, environment) {
        this.scene = scene;
        this.environment = environment;
    }

    detectHits(origin, radius, targetTypes = ['monster', 'player', 'tower']) {
        const hitTargets = [];
        const hitSphere = new THREE.Sphere(origin, radius);

        // Check monsters
        if (targetTypes.includes('monster')) {
            this.environment.jungleCamps.forEach((camp) => {
                camp.monsterInstances = camp.monsterInstances.filter(
                    (monster) => {
                        if (!monster.isAlive) {
                            // Clean up dead monster
                            if (monster.mesh && monster.mesh.parent) {
                                monster.mesh.parent.remove(monster.mesh);
                            }
                            return false;
                        }

                        if (
                            monster.isAlive &&
                            this.checkCollision(hitSphere, monster.mesh)
                        ) {
                            hitTargets.push(monster);
                        }
                        return true;
                    }
                );
            });
        }

        // Check towers
        if (targetTypes.includes('tower')) {
            this.environment.towers.forEach((tower) => {
                if (this.checkCollision(hitSphere, tower.mesh)) {
                    hitTargets.push(tower);
                }
            });
        }

        // Check other players (for future multiplayer implementation)
        if (targetTypes.includes('player')) {
            // Add player hit detection here when implementing multiplayer
        }

        return hitTargets;
    }

    checkCollision(sphere, target) {
        const targetBox = new THREE.Box3().setFromObject(target);
        return sphere.intersectsBox(targetBox);
    }

    // For directional abilities (like skillshots)
    detectLineHits(
        start,
        direction,
        length,
        width,
        targetTypes = ['monster', 'player', 'tower']
    ) {
        const hits = [];
        const ray = new THREE.Ray(start, direction.normalize());

        // Create a box to represent the ability's hitbox
        const halfWidth = width / 2;
        const boxGeometry = new THREE.BoxGeometry(width, width, length);
        const hitBox = new THREE.Box3().setFromObject(
            new THREE.Mesh(boxGeometry).translateZ(length / 2)
        );

        // Transform hitbox to match ray direction
        hitBox.applyMatrix4(
            new THREE.Matrix4().lookAt(
                start,
                start.clone().add(direction),
                new THREE.Vector3(0, 1, 0)
            )
        );

        return this.detectHits(start, length, targetTypes).filter((target) =>
            this.checkCollision(hitBox, target.mesh)
        );
    }
}
