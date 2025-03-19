import * as THREE from 'three';
import { AbilityHitDetection } from './AbilityHitDetection.js';

export class Ability {
    constructor(config = {}) {
        this.name = config.name;
        this.cooldown = config.cooldown || 0;
        this.manaCost = config.manaCost || 0;
        this.lastUsed = 0; // Initialize lastUsed to 0
        this.lastAttempted = 0;
        this.particles = [];
        this.scene = null;
        this.environment = null;
        this.hitDetection = null;
    }

    initialize(scene, environment) {
        this.scene = scene;
        this.environment = environment;
        this.hitDetection = new AbilityHitDetection(scene, environment);
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

    applyDamage(targets, damage) {
        targets.forEach((target) => {
            if (target.takeDamage) {
                target.takeDamage(damage);
            }
        });
    }

    castAreaEffect(origin, radius, damage) {
        const hitTargets = this.hitDetection.detectHits(origin, radius);
        this.applyDamage(hitTargets, damage);
        return hitTargets;
    }

    castDirectional(start, direction, length, width, damage) {
        const hitTargets = this.hitDetection.detectLineHits(
            start,
            direction,
            length,
            width
        );
        this.applyDamage(hitTargets, damage);
        return hitTargets;
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
