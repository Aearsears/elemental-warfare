import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class Meteor extends Ability {
    constructor() {
        super({
            name: 'Meteor',
            cooldown: 60,
            manaCost: 100
        });
    }

    use(champion) {
        if (super.use(champion)) {
            // Create the meteor
            const meteor = new THREE.Group();

            // Main meteor body
            const core = new THREE.Mesh(
                new THREE.SphereGeometry(1, 12, 12),
                new THREE.MeshPhongMaterial({
                    color: 0xff3300,
                    emissive: 0xff0000,
                    emissiveIntensity: 1
                })
            );
            meteor.add(core);

            // Meteor trail
            const trail = new THREE.Mesh(
                new THREE.ConeGeometry(0.8, 3, 12),
                new THREE.MeshPhongMaterial({
                    color: 0xff6600,
                    transparent: true,
                    opacity: 0.6
                })
            );
            trail.rotation.x = Math.PI;
            trail.position.y = 1.5;
            meteor.add(trail);

            // Position meteor high above the player
            meteor.position.copy(champion.getPosition());
            meteor.position.y = 30;

            this.particles.push({
                mesh: meteor,
                life: 3,
                velocity: new THREE.Vector3(0, -15, 0),
                hasImpacted: false,
                update: (delta) => this.updateMeteor(meteor, delta, champion)
            });

            this.scene.add(meteor);
            return true;
        }
        return false;
    }

    updateMeteor(meteor, delta, champion) {
        const particle = this.particles[this.particles.length - 1];

        if (!particle.hasImpacted) {
            // Update meteor position
            meteor.position.add(
                particle.velocity.clone().multiplyScalar(delta)
            );

            // Create fire particles
            this.createFireParticle(meteor.position);

            // Check for impact
            if (meteor.position.y <= 0.5) {
                particle.hasImpacted = true;
                this.createExplosion(meteor.position);
                meteor.visible = false;
            }
        }
    }

    createFireParticle(position) {
        const fire = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 4, 4),
            new THREE.MeshPhongMaterial({
                color: 0xff6600,
                transparent: true,
                opacity: 0.6,
                emissive: 0xff3300
            })
        );

        fire.position.copy(position);
        fire.position.x += (Math.random() - 0.5) * 0.5;
        fire.position.z += (Math.random() - 0.5) * 0.5;

        this.particles.push({
            mesh: fire,
            life: 0.5,
            update: (delta) => {
                fire.position.y += delta * 2;
                fire.material.opacity -= delta * 2;
                fire.scale.multiplyScalar(0.95);
            }
        });

        this.scene.add(fire);
    }

    createExplosion(position) {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const debris = new THREE.Mesh(
                new THREE.TetrahedronGeometry(0.3),
                new THREE.MeshPhongMaterial({
                    color: 0xff4400,
                    emissive: 0xff2200,
                    emissiveIntensity: 1
                })
            );

            debris.position.copy(position);

            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 5;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                5 + Math.random() * 5,
                Math.sin(angle) * speed
            );

            this.particles.push({
                mesh: debris,
                life: 1,
                velocity: velocity,
                update: (delta) => {
                    velocity.y -= delta * 9.8;
                    debris.position.add(velocity.clone().multiplyScalar(delta));
                    debris.rotation.x += delta * 5;
                    debris.rotation.z += delta * 5;
                    debris.material.opacity -= delta;
                }
            });

            this.scene.add(debris);
        }
    }
}
