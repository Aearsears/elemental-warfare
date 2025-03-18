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

        // Check collisions with destructibles
        const playerBoundingBox = new THREE.Box3().setFromObject(
            player.getMesh()
        );
        for (const destructible of this.environment.destructibles) {
            const destructibleBoundingBox = new THREE.Box3().setFromObject(
                destructible
            );
            if (playerBoundingBox.intersectsBox(destructibleBoundingBox)) {
                return true;
            }
        }

        // Check collisions with towers
        for (const tower of this.environment.towers) {
            const towerBoundingBox = new THREE.Box3().setFromObject(tower.mesh);
            if (playerBoundingBox.intersectsBox(towerBoundingBox)) {
                return true;
            }
        }

        return false;
    }
}
