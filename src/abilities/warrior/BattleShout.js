import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class BattleShout extends Ability {
    constructor() {
        super({
            name: 'Battle Shout',
            cooldown: 15,
            manaCost: 30
        });
    }

    use(champion) {
        if (super.use(champion)) {
            const ringCount = 3;
            const particlesPerRing = 16;

            for (let ring = 0; ring < ringCount; ring++) {
                this.createRing(champion, ring, particlesPerRing);
            }
            return true;
        }
        return false;
    }

    createRing(champion, ringIndex, particleCount) {
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 1 + ringIndex;

            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshPhongMaterial({
                    color: 0xffcc00,
                    transparent: true,
                    opacity: 0.8,
                    emissive: 0xffcc00
                })
            );

            particle.position.copy(champion.getPosition());
            particle.position.y += 1;

            this.particles.push({
                mesh: particle,
                life: 1.5,
                initialY: particle.position.y,
                angle: angle,
                radius: radius,
                update: (delta) => {
                    particle.position.y += delta * 2;
                    particle.material.opacity -= delta * 0.5;
                    particle.scale.multiplyScalar(1 + delta);
                }
            });

            this.scene.add(particle);
        }
    }
}
