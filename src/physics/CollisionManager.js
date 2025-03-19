import * as THREE from 'three';

export class CollisionManager {
    constructor(environment) {
        this.environment = environment;
        this.mapBounds = new THREE.Box3(
            new THREE.Vector3(-25, -10, -25),
            new THREE.Vector3(25, 10, 25)
        );
    }

    checkCollisions(player) {
        // Check map boundaries
        const playerPosition = player.getPosition();
        if (!this.mapBounds.containsPoint(playerPosition)) {
            return true;
        }

        const playerMesh = player.getMesh();
        if (!playerMesh) return false;

        const playerBoundingBox = new THREE.Box3().setFromObject(playerMesh);

        // Check collisions with structures (bases)
        for (const base of this.environment.bases) {
            if (base.mesh) {
                const baseBoundingBox = new THREE.Box3().setFromObject(
                    base.mesh
                );
                if (playerBoundingBox.intersectsBox(baseBoundingBox)) {
                    return true;
                }
            }
        }

        // Check collisions with towers
        for (const tower of this.environment.towers) {
            if (tower.mesh) {
                const towerBoundingBox = new THREE.Box3().setFromObject(
                    tower.mesh
                );
                if (playerBoundingBox.intersectsBox(towerBoundingBox)) {
                    return true;
                }
            }
        }

        // Check collisions with monsters
        for (const camp of this.environment.jungleCamps) {
            for (const monster of camp.monsterInstances) {
                if (monster.isAlive && monster.mesh) {
                    const monsterBoundingBox = new THREE.Box3().setFromObject(
                        monster.mesh
                    );
                    if (playerBoundingBox.intersectsBox(monsterBoundingBox)) {
                        return true;
                    }
                }
            }
        }

        // Check collisions with trees
        for (const tree of this.environment.trees) {
            if (tree && tree.mesh) {
                // Check both tree and its mesh exist
                const treeBoundingBox = new THREE.Box3().setFromObject(
                    tree.mesh
                );
                if (playerBoundingBox.intersectsBox(treeBoundingBox)) {
                    return true;
                }
            }
        }

        // Check collisions with destructibles
        for (const destructible of this.environment.destructibles) {
            if (destructible.mesh) {
                const destructibleBoundingBox = new THREE.Box3().setFromObject(
                    destructible.mesh
                );
                if (playerBoundingBox.intersectsBox(destructibleBoundingBox)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Helper method to get collision normal
    getCollisionNormal(playerBox, objectBox) {
        const playerCenter = new THREE.Vector3();
        const objectCenter = new THREE.Vector3();
        playerBox.getCenter(playerCenter);
        objectBox.getCenter(objectCenter);

        return objectCenter.sub(playerCenter).normalize();
    }
}
