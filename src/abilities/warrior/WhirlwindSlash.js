import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class WhirlwindSlash extends Ability {
    constructor() {
        super({
            name: 'Whirlwind Slash',
            cooldown: 8,
            manaCost: 25
        });
    }

    use(champion) {
        if (super.use(champion)) {
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 2;

                const particle = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 1, 0.1),
                    new THREE.MeshPhongMaterial({
                        color: 0xff4400,
                        transparent: true,
                        opacity: 0.6,
                        emissive: 0xff4400,
                        emissiveIntensity: 0.5
                    })
                );

                this.setupParticle(particle, champion, angle, radius, i);
            }
            return true;
        }
        return false;
    }

    setupParticle(particle, champion, angle, radius, index) {
        particle.position.copy(champion.getPosition());
        particle.position.x += Math.cos(angle) * radius;
        particle.position.z += Math.sin(angle) * radius;

        this.particles.push({
            mesh: particle,
            life: 1,
            angle: angle,
            radius: radius,
            update: (delta) =>
                this.updateParticle(particle, champion, delta, index)
        });

        this.scene.add(particle);
    }

    updateParticle(particle, champion, delta, index) {
        particle.rotation.y += delta * 10;
        particle.material.opacity -= delta;
        particle.position.y += delta;

        const newAngle = this.particles[index].angle + delta * 5;
        particle.position.x =
            champion.getPosition().x +
            Math.cos(newAngle) * this.particles[index].radius;
        particle.position.z =
            champion.getPosition().z +
            Math.sin(newAngle) * this.particles[index].radius;
        this.particles[index].angle = newAngle;
    }
}
