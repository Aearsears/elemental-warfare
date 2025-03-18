import * as THREE from 'three';

export class Ability {
    constructor(config) {
        this.name = config.name;
        this.cooldown = config.cooldown;
        this.manaCost = config.manaCost;
        this.lastUsed = 0;
        this.particles = [];
    }

    initialize(scene) {
        this.scene = scene;
    }

    canUse(champion) {
        const now = Date.now();
        return (
            now - this.lastUsed >= this.cooldown * 1000 &&
            champion.mana >= this.manaCost
        );
    }

    use(champion) {
        if (this.canUse(champion)) {
            this.lastUsed = Date.now();
            champion.mana -= this.manaCost;
            return true;
        }
        return false;
    }

    update(delta) {
        // Update particle effects
        this.particles.forEach((particle, index) => {
            if (particle.life <= 0) {
                this.scene.remove(particle.mesh);
                this.particles.splice(index, 1);
            } else {
                particle.life -= delta;
                particle.update(delta);
            }
        });
    }
}
