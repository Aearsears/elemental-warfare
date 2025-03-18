import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class ArcaneBlast extends Ability {
    constructor() {
        super({
            name: 'Arcane Blast',
            cooldown: 8,
            manaCost: 45
        });
    }

    use(champion) {
        if (super.use(champion)) {
            const burstCount = 16;
            for (let i = 0; i < burstCount; i++) {
                const angle = (i / burstCount) * Math.PI * 2;
                this.createArcaneBolt(champion, angle);
            }
            return true;
        }
        return false;
    }

    createArcaneBolt(champion, angle) {
        const bolt = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.2),
            new THREE.MeshPhongMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.8,
                emissive: 0xff00ff,
                emissiveIntensity: 0.5
            })
        );

        bolt.position.copy(champion.getPosition());
        bolt.position.y += 1;

        const velocity = new THREE.Vector3(
            Math.cos(angle) * 8,
            4,
            Math.sin(angle) * 8
        );

        this.particles.push({
            mesh: bolt,
            life: 1,
            velocity: velocity,
            update: (delta) => {
                velocity.y -= delta * 9.8; // Add gravity
                bolt.position.add(velocity.clone().multiplyScalar(delta));
                bolt.rotation.x += delta * 5;
                bolt.rotation.z += delta * 5;
                bolt.material.opacity -= delta * 0.8;
            }
        });

        this.scene.add(bolt);
    }
}
