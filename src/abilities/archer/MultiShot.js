import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class MultiShot extends Ability {
    constructor() {
        super({
            name: 'Multi Shot',
            cooldown: 12,
            manaCost: 35
        });
    }

    use(champion) {
        if (super.use(champion)) {
            const arrowCount = 5;
            const spreadAngle = Math.PI / 6; // 30 degrees

            for (let i = 0; i < arrowCount; i++) {
                const angle =
                    (i - (arrowCount - 1) / 2) *
                    (spreadAngle / (arrowCount - 1));
                this.createArrow(champion, angle);
            }
            return true;
        }
        return false;
    }

    createArrow(champion, angleOffset) {
        const arrow = new THREE.Group();

        // Arrow head
        const head = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.3, 8),
            new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                emissive: 0x666666
            })
        );
        head.position.z = 0.4;
        arrow.add(head);

        // Arrow shaft
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.8),
            new THREE.MeshPhongMaterial({ color: 0x8b4513 })
        );
        shaft.rotation.x = Math.PI / 2;
        shaft.position.z = 0.1;
        arrow.add(shaft);

        // Set initial position and rotation
        arrow.position.copy(champion.getPosition());
        arrow.position.y += 1.5;
        arrow.rotation.y = champion.mesh.rotation.y + angleOffset;

        // Calculate direction with spread
        const direction = new THREE.Vector3(0, 0, 1)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), arrow.rotation.y)
            .normalize();

        // Store velocity in closure
        const velocity = direction.multiplyScalar(20);

        this.particles.push({
            mesh: arrow,
            life: 2,
            update: (delta) => {
                // Update position using closure-scoped velocity
                arrow.position.add(velocity.clone().multiplyScalar(delta));

                // Add trail effect
                this.createTrail(arrow.position);

                // Rotate arrow along flight path
                arrow.rotation.x += delta * 10;
            }
        });

        this.scene.add(arrow);
    }

    createTrail(position) {
        const trail = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 4, 4),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.4
            })
        );

        trail.position.copy(position);

        this.particles.push({
            mesh: trail,
            life: 0.3,
            update: (delta) => {
                trail.material.opacity -= delta * 2;
                trail.scale.multiplyScalar(0.9);
            }
        });

        this.scene.add(trail);
    }
}
