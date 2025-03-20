import * as THREE from 'three';

export class EnvironmentCleanup {
    constructor(scene, environment) {
        this.scene = scene;
        this.environment = environment;
        this.initializeListeners();
    }

    initializeListeners() {
        this.initializeMonsterDeathListener();
        this.initializeDestructibleListener();
    }

    // todo : fix bug where monsters are not removed from scene and players cant move
    initializeMonsterDeathListener() {
        document.addEventListener('monsterDeath', (event) => {
            const deadMonster = event.detail.monster;
            if (!deadMonster) return;

            const camp = this.environment.jungleCamps.find((camp) =>
                camp.monsterInstances.includes(deadMonster)
            );

            if (camp) {
                // Clean up the monster first
                this.cleanupMonster(deadMonster);

                // Then update camp's monster list
                this.updateCampMonsters(camp, deadMonster);

                // Force an update of the environment's monster list
                this.cleanupDeadMonsters();
            }
        });
    }

    initializeDestructibleListener() {
        document.addEventListener('destructibleDestroyed', (event) => {
            const destructible = event.detail.destructibleGroup;
            if (destructible) {
                this.cleanupDestructible(destructible);
            }
        });
    }

    cleanupMonster(monster) {
        if (!monster) return;

        // Remove from scene first if still attached
        if (monster.mesh && monster.mesh.parent) {
            monster.mesh.parent.remove(monster.mesh);
        }

        // Dispose of resources
        if (monster.mesh) {
            this.disposeObject(monster.mesh);
        }

        // Clean up health bar if it exists
        if (monster.healthBar) {
            monster.healthBar.remove();
            monster.healthBar = null;
        }

        // Clear references
        monster.mesh = null;
        monster.boundingBox = null;
    }

    updateCampMonsters(camp, deadMonster) {
        camp.monsterInstances = camp.monsterInstances.filter(
            (m) => m !== deadMonster
        );

        if (camp.monsterInstances.length === 0) {
            camp.startRespawnTimer();
        }
    }

    cleanupDestructible(destructible) {
        const worldPosition = new THREE.Vector3();
        destructible.getWorldPosition(worldPosition);
        this.environment.destructionEffect.create(worldPosition);

        if (destructible.parent) {
            destructible.parent.remove(destructible);
        }

        this.disposeObject(destructible);

        const index = this.environment.destructibles.indexOf(destructible);
        if (index > -1) {
            this.environment.destructibles.splice(index, 1);
        }
    }

    disposeObject(object) {
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }

    cleanupDeadMonsters() {
        this.environment.jungleCamps.forEach((camp) => {
            camp.monsterInstances = camp.monsterInstances.filter((monster) => {
                if (!monster.isAlive) {
                    this.cleanupMonster(monster);
                    return false;
                }
                return true;
            });
        });
    }
}
