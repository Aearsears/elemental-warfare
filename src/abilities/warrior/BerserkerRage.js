import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class BerserkerRage extends Ability {
    constructor() {
        super({
            name: 'Berserker Rage',
            cooldown: 45,
            manaCost: 50
        });
    }

    use(champion) {
        if (super.use(champion)) {
            // Create rising flame particles
            for (let i = 0; i < 30; i++) {
                this.createFlameParticle(champion);
            }

            // Add rage effect to champion
            champion.damage *= 1.5;
            champion.mesh.material.emissive.setHex(0xff0000);

            // Reset after 8 seconds
            setTimeout(() => {
                champion.damage /= 1.5;
                champion.mesh.material.emissive.setHex(0x000000);
            }, 8000);

            return true;
        }
        return false;
    }

    createFlameParticle(champion) {
        const particle = new THREE.Mesh(
            new THREE.TetrahedronGeometry(0.2),
            new THREE.MeshPhongMaterial({
                color: 0xff2200,
                transparent: true,
                opacity: 0.8,
                emissive: 0xff2200,
                emissiveIntensity: 0.5
            })
        );

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1;

        particle.position.copy(champion.getPosition());
        particle.position.x += Math.cos(angle) * radius;
        particle.position.z += Math.sin(angle) * radius;
        particle.position.y += 0.5;

        this.particles.push({
            mesh: particle,
            life: 1 + Math.random(),
            velocity: new THREE.Vector3(
                Math.random() * 0.2 - 0.1,
                0.5 + Math.random() * 0.5,
                Math.random() * 0.2 - 0.1
            ),
            update: (delta) => {
                particle.position.add(
                    this.particles[
                        this.particles.length - 1
                    ].velocity.multiplyScalar(delta)
                );
                particle.material.opacity -= delta * 0.8;
                particle.rotation.x += delta * 2;
                particle.rotation.z += delta * 2;
            }
        });

        this.scene.add(particle);
    }
}
