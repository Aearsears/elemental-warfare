import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class ShieldBlock extends Ability {
    constructor() {
        super({
            name: 'Shield Block',
            cooldown: 12,
            manaCost: 20
        });
    }

    use(champion) {
        if (super.use(champion)) {
            const shieldGeometry = new THREE.RingGeometry(1.8, 2, 32);
            const shieldMaterial = new THREE.MeshPhongMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });

            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.rotation.x = Math.PI / 2;
            shield.position.copy(champion.getPosition());
            shield.position.y += 0.1;

            this.particles.push({
                mesh: shield,
                life: 3,
                update: (delta) => {
                    shield.rotation.z += delta * 2;
                    shield.material.opacity = Math.sin(shield.life * 2) * 0.6;
                    shield.scale.addScalar(delta * 0.1);
                }
            });

            this.scene.add(shield);
            return true;
        }
        return false;
    }
}
