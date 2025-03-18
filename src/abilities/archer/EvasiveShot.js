import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class EvasiveShot extends Ability {
    constructor() {
        super({
            name: 'Evasive Shot',
            cooldown: 10,
            manaCost: 30
        });
        this.dashDistance = 5;
        this.dashDuration = 0.3;
    }

    use(champion) {
        if (super.use(champion)) {
            // Get backward direction relative to champion's rotation
            const backwardDirection = new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(champion.mesh.quaternion);

            // Store initial position
            const startPos = champion.getPosition().clone();
            const endPos = startPos
                .clone()
                .add(backwardDirection.multiplyScalar(this.dashDistance));

            // Create dash trail effect
            this.createDashTrail(champion);

            // Animate the dash
            let elapsed = 0;
            const animate = (timestamp) => {
                if (!this.startTime) this.startTime = timestamp;
                elapsed = (timestamp - this.startTime) / 1000;

                if (elapsed < this.dashDuration) {
                    // Smooth easing
                    const progress = Math.sin(
                        ((elapsed / this.dashDuration) * Math.PI) / 2
                    );
                    const newPos = new THREE.Vector3().lerpVectors(
                        startPos,
                        endPos,
                        progress
                    );
                    champion.setPosition(newPos.x, newPos.y, newPos.z);

                    requestAnimationFrame(animate);
                } else {
                    // Ensure final position is exact
                    champion.setPosition(endPos.x, endPos.y, endPos.z);
                    this.fireArrow(champion);
                }
            };

            this.startTime = null;
            requestAnimationFrame(animate);
            return true;
        }
        return false;
    }

    createDashTrail(champion) {
        const trailCount = 10;
        for (let i = 0; i < trailCount; i++) {
            const trail = champion.mesh.clone();
            trail.material = new THREE.MeshBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.5 - (i / trailCount) * 0.5
            });

            this.particles.push({
                mesh: trail,
                life: 0.5,
                update: (delta) => {
                    trail.material.opacity -= delta * 2;
                }
            });

            this.scene.add(trail);
        }
    }

    fireArrow(champion) {
        // Create powerful arrow with special effects
        const arrow = new THREE.Group();

        // Glowing arrow head
        const head = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.4, 8),
            new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 1
            })
        );
        head.position.y = 0.4;
        arrow.add(head);

        // Energy trail
        const trail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1),
            new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.6
            })
        );
        trail.position.y = 0.1;
        arrow.add(trail);

        // Set position and direction
        arrow.position.copy(champion.getPosition());
        arrow.position.y += 1.5;
        arrow.rotation.copy(champion.mesh.rotation);

        const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(
            champion.mesh.quaternion
        );

        // Store velocity in closure
        const velocity = direction.multiplyScalar(30);

        this.particles.push({
            mesh: arrow,
            life: 1,
            update: (delta) => {
                // Use closure-scoped velocity
                const movement = velocity.clone().multiplyScalar(delta);
                arrow.position.add(movement);
                this.createEnergyTrail(arrow.position);
            }
        });

        this.scene.add(arrow);
    }

    createEnergyTrail(position) {
        const energy = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({
                color: 0x00ffff,
                size: 0.1,
                transparent: true,
                opacity: 0.6
            })
        );

        const positions = new Float32Array(9);
        for (let i = 0; i < 9; i += 3) {
            positions[i] = position.x + (Math.random() - 0.5) * 0.2;
            positions[i + 1] = position.y + (Math.random() - 0.5) * 0.2;
            positions[i + 2] = position.z + (Math.random() - 0.5) * 0.2;
        }

        energy.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        this.particles.push({
            mesh: energy,
            life: 0.3,
            update: (delta) => {
                energy.material.opacity -= delta * 2;
            }
        });

        this.scene.add(energy);
    }
}
