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
            const camp = this.environment.jungleCamps.find((camp) =>
                camp.monsterInstances.includes(deadMonster)
            );

            if (camp) {
                this.cleanupMonster(deadMonster);
                this.updateCampMonsters(camp, deadMonster);
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
        if (monster.mesh) {
            this.scene.remove(monster.mesh);
            this.disposeObject(monster.mesh);
        }

        if (monster.healthBar) {
            monster.healthBar.remove();
        }

        monster.mesh = null;
        monster.healthBar = null;
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
