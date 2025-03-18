import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class BerserkerRage extends Ability {
    constructor() {
        super({
            name: 'Berserker Rage',
            cooldown: 45,
            manaCost: 50
        });
        this.rageEffect = null;
        this.activeChampion = null; // Add reference to store active champion
    }

    use(champion) {
        if (super.use(champion)) {
            this.activeChampion = champion; // Store champion reference

            // Create rising flame particles
            for (let i = 0; i < 30; i++) {
                this.createFlameParticle(champion);
            }

            // Add rage effect to champion
            champion.damage *= 1.5;

            // Create rage visual effect
            this.createRageEffect(champion);

            // Reset after 8 seconds
            setTimeout(() => {
                champion.damage /= 1.5;
                if (this.rageEffect) {
                    this.scene.remove(this.rageEffect);
                    this.rageEffect = null;
                }
                this.activeChampion = null; // Clear champion reference
            }, 8000);

            return true;
        }
        return false;
    }

    createRageEffect(champion) {
        // Remove existing effect if any
        if (this.rageEffect) {
            this.scene.remove(this.rageEffect);
        }

        // Create a red glowing sphere around the champion
        this.rageEffect = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.3,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            })
        );

        this.rageEffect.position.copy(champion.getPosition());
        this.scene.add(this.rageEffect);
    }

    update(delta) {
        // Update existing particles
        super.update(delta);

        // Update rage effect position if it exists
        if (this.rageEffect && this.activeChampion) {
            this.rageEffect.position.copy(this.activeChampion.getPosition());
        }
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
