import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class IceBarrier extends Ability {
    constructor() {
        super({
            name: 'Ice Barrier',
            cooldown: 15,
            manaCost: 35,
            damage: 20 // Added small damage for when crystals hit enemies
        });
        this.shieldDuration = 6000;
    }

    use(champion) {
        if (super.use(champion)) {
            const hitTargets = new Set();
            const crystalCount = 8;

            for (let i = 0; i < crystalCount; i++) {
                const angle = (i / crystalCount) * Math.PI * 2;
                this.createIceCrystal(champion, angle, hitTargets);
            }

            // Add shield effect to champion
            champion.defense *= 1.5;
            setTimeout(() => (champion.defense /= 1.5), this.shieldDuration);

            return true;
        }
        return false;
    }

    createIceCrystal(champion, angle, hitTargets) {
        const crystal = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.8, 4),
            new THREE.MeshPhongMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.7,
                emissive: 0x4488ff,
                emissiveIntensity: 0.5
            })
        );

        const radius = 2;
        crystal.position.copy(champion.getPosition());
        crystal.position.x += Math.cos(angle) * radius;
        crystal.position.z += Math.sin(angle) * radius;
        crystal.position.y += 1;
        crystal.rotation.y = -angle;
        crystal.rotation.x = Math.PI / 6;

        this.particles.push({
            mesh: crystal,
            life: 6,
            angle: angle,
            update: (delta) => {
                crystal.position.copy(champion.getPosition());
                crystal.position.x +=
                    Math.cos(this.particles[this.particles.length - 1].angle) *
                    radius;
                crystal.position.z +=
                    Math.sin(this.particles[this.particles.length - 1].angle) *
                    radius;
                crystal.position.y += 1 + Math.sin(Date.now() * 0.003) * 0.2;
                this.particles[this.particles.length - 1].angle += delta;
                crystal.rotation.y =
                    -this.particles[this.particles.length - 1].angle;

                // Add hit detection
                const hits = this.hitDetection.detectHits(
                    crystal.position,
                    0.4,
                    ['monster', 'tower']
                );

                for (const target of hits) {
                    if (!hitTargets.has(target.id)) {
                        hitTargets.add(target.id);
                        if (target.takeDamage) {
                            target.takeDamage(this.damage);
                            this.createFrostEffect(target.mesh.position);
                        }
                    }
                }

                if (crystal.life < 1) {
                    crystal.material.opacity -= delta;
                }
                return true;
            }
        });

        this.scene.add(crystal);
    }

    createFrostEffect(position) {
        const particleCount = 15;
        const duration = 1.5;

        for (let i = 0; i < particleCount; i++) {
            const iceParticle = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.1 + Math.random() * 0.1),
                new THREE.MeshPhongMaterial({
                    color: 0xaaddff,
                    emissive: 0x88ccff,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.7,
                    shininess: 100
                })
            );

            iceParticle.position.copy(position);
            iceParticle.position.y += 0.5;

            // Create expanding ring effect
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.2 + Math.random() * 0.3;
            const floatSpeed = 1 + Math.random() * 0.5;
            const spinSpeed = Math.PI * (1 + Math.random());

            this.particles.push({
                mesh: iceParticle,
                life: duration,
                initialLife: duration,
                update: (delta) => {
                    // Expand outward and upward
                    iceParticle.position.y += floatSpeed * delta;
                    iceParticle.position.x =
                        position.x +
                        Math.cos(angle) *
                            (radius *
                                (1 - iceParticle.userData.life / duration));
                    iceParticle.position.z =
                        position.z +
                        Math.sin(angle) *
                            (radius *
                                (1 - iceParticle.userData.life / duration));

                    // Rotate the ice crystal
                    iceParticle.rotation.x += spinSpeed * delta;
                    iceParticle.rotation.z += spinSpeed * delta;

                    // Fade out and shrink
                    const lifeProgress = iceParticle.userData.life / duration;
                    iceParticle.material.opacity = lifeProgress * 0.7;
                    iceParticle.scale.setScalar(lifeProgress);

                    return true;
                }
            });

            this.scene.add(iceParticle);
        }
    }
}
