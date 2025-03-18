import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class Fireball extends Ability {
    constructor() {
        super({
            name: 'Fireball',
            cooldown: 5,
            manaCost: 30
        });
    }

    use(champion) {
        if (super.use(champion)) {
            const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(
                champion.mesh.quaternion
            );

            const fireball = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshPhongMaterial({
                    color: 0xff4400,
                    emissive: 0xff2200,
                    emissiveIntensity: 1
                })
            );

            fireball.position.copy(champion.getPosition());
            fireball.position.y += 1;

            this.particles.push({
                mesh: fireball,
                life: 2,
                velocity: direction.multiplyScalar(10),
                update: (delta) => {
                    fireball.position.add(
                        this.particles[
                            this.particles.length - 1
                        ].velocity.multiplyScalar(delta)
                    );
                    this.createFireTrail(fireball.position);
                }
            });

            this.scene.add(fireball);
            return true;
        }
        return false;
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
