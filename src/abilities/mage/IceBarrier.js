import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class IceBarrier extends Ability {
    constructor() {
        super({
            name: 'Ice Barrier',
            cooldown: 15,
            manaCost: 35
        });
    }

    use(champion) {
        if (super.use(champion)) {
            const crystalCount = 8;
            for (let i = 0; i < crystalCount; i++) {
                const angle = (i / crystalCount) * Math.PI * 2;
                this.createIceCrystal(champion, angle);
            }

            // Add shield effect to champion
            champion.defense *= 1.5;
            setTimeout(() => (champion.defense /= 1.5), 6000);

            return true;
        }
        return false;
    }

    createIceCrystal(champion, angle) {
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

                if (crystal.life < 1) {
                    crystal.material.opacity -= delta;
                }
            }
        });

        this.scene.add(crystal);
    }
}
