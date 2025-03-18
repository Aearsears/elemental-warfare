import * as THREE from 'three';

export class Ability {
    constructor(config) {
        this.name = config.name;
        this.cooldown = config.cooldown || 0;
        this.manaCost = config.manaCost || 0;
        this.lastUsed = 0; // Initialize lastUsed to 0
        this.lastAttempted = 0;
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
        this.lastAttempted = Date.now();

        // Check if ability can be used
        const currentTime = Date.now();
        const timeSinceUsed = (currentTime - this.lastUsed) / 1000;

        if (timeSinceUsed < this.cooldown) {
            return false;
        }

        if (champion.mana < this.manaCost) {
            return false;
        }

        // Ability can be used
        this.lastUsed = currentTime;
        champion.mana -= this.manaCost;
        return true;
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
