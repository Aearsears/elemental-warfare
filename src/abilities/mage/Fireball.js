import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class Fireball extends Ability {
    constructor() {
        super({
            name: 'Fireball',
            cooldown: 5,
            manaCost: 30,
            damage: 50 // Base damage for fireball
        });
        this.projectileSpeed = 15;
    }

    use(champion) {
        if (super.use(champion)) {
            const direction = new THREE.Vector3(0, 0, 1)
                .applyQuaternion(champion.mesh.quaternion)
                .normalize();

            const fireball = this.createFireballMesh();
            fireball.position.copy(champion.getPosition());
            fireball.position.y += 1;

            const hitTargets = new Set();

            this.particles.push({
                mesh: fireball,
                life: 2,
                velocity: direction.multiplyScalar(this.projectileSpeed),
                update: (delta) =>
                    this.updateFireball(delta, fireball, hitTargets)
            });

            this.scene.add(fireball);
            return true;
        }
        return false;
    }

    updateFireball(delta, fireball, hitTargets) {
        fireball.position.add(
            this.particles[0].velocity.clone().multiplyScalar(delta)
        );
        this.createFireTrail(fireball.position);

        const hits = this.hitDetection.detectHits(fireball.position, 1, [
            'monster',
            'tower'
        ]);

        for (const target of hits) {
            if (!hitTargets.has(target.id)) {
                hitTargets.add(target.id);
                if (target.takeDamage) {
                    target.takeDamage(this.damage);
                    this.createExplosion(fireball.position);
                    return false; // Destroy fireball on hit
                }
            }
        }
        return true;
    }

    createFireballMesh() {
        return new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshPhongMaterial({
                color: 0xff4400,
                emissive: 0xff2200,
                emissiveIntensity: 1
            })
        );
    }

    createExplosion(position) {
        // Create explosion particles
        for (let i = 0; i < 12; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 4, 4),
                new THREE.MeshPhongMaterial({
                    color: 0xff4400,
                    emissive: 0xff2200,
                    emissiveIntensity: 1,
                    transparent: true
                })
            );

            particle.position.copy(position);

            // Random direction for explosion
            const angle = ((Math.PI * 2) / 12) * i;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * 5,
                Math.random() * 2,
                Math.sin(angle) * 5
            );

            this.particles.push({
                mesh: particle,
                life: 0.5,
                update: (delta) => {
                    velocity.y -= 9.8 * delta; // Add gravity
                    particle.position.add(velocity.multiplyScalar(delta));
                    particle.material.opacity -= delta * 2;
                }
            });

            this.scene.add(particle);
        }
    }

    createFireTrail(position) {
        const trail = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 4, 4),
            new THREE.MeshPhongMaterial({
                color: 0xff8800,
                transparent: true,
                opacity: 0.6,
                emissive: 0xff4400
            })
        );

        trail.position.copy(position);

        this.particles.push({
            mesh: trail,
            life: 0.5,
            update: (delta) => {
                trail.material.opacity -= delta * 2;
                trail.scale.multiplyScalar(0.95);
            }
        });

        this.scene.add(trail);
    }
}
