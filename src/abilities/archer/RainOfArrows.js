import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class RainOfArrows extends Ability {
    constructor() {
        super({
            name: 'Rain of Arrows',
            cooldown: 15,
            manaCost: 45
        });
        this.areaRadius = 3;
        this.duration = 3;
    }

    use(champion) {
        if (super.use(champion)) {
            // Create target area indicator
            const areaMarker = this.createAreaMarker();
            areaMarker.position.copy(champion.getPosition());
            areaMarker.position.z += 5; // Place area in front of archer

            // Start arrow rain
            this.startArrowRain(areaMarker.position);

            // Remove area marker after duration
            setTimeout(() => {
                this.scene.remove(areaMarker);
            }, this.duration * 1000);

            return true;
        }
        return false;
    }

    createAreaMarker() {
        const geometry = new THREE.CircleGeometry(this.areaRadius, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.rotation.x = -Math.PI / 2;
        this.scene.add(marker);
        return marker;
    }

    startArrowRain(targetPos) {
        const arrowsPerWave = 10;
        const waves = this.duration * 2; // 2 waves per second
        let currentWave = 0;

        const spawnWave = () => {
            for (let i = 0; i < arrowsPerWave; i++) {
                this.spawnArrow(targetPos);
            }
            currentWave++;

            if (currentWave < waves) {
                setTimeout(spawnWave, 500);
            }
        };

        spawnWave();
    }

    spawnArrow(targetPos) {
        const arrow = new THREE.Group();

        // Arrow head and shaft (reusing MultiShot arrow model)
        const head = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.3, 8),
            new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                emissive: 0x666666
            })
        );
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.8),
            new THREE.MeshPhongMaterial({ color: 0x8b4513 })
        );

        head.position.y = 0.4;
        shaft.position.y = 0.1;
        arrow.add(head);
        arrow.add(shaft);

        // Random position within area
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.areaRadius;
        const startHeight = 20;

        arrow.position.set(
            targetPos.x + Math.cos(angle) * radius,
            startHeight,
            targetPos.z + Math.sin(angle) * radius
        );

        arrow.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);

        this.particles.push({
            mesh: arrow,
            life: 2,
            velocity: new THREE.Vector3(0, -15, 0),
            hasImpacted: false,
            update: (delta) => {
                if (!this.particles[this.particles.length - 1].hasImpacted) {
                    arrow.position.add(
                        this.particles[
                            this.particles.length - 1
                        ].velocity.multiplyScalar(delta)
                    );

                    if (arrow.position.y <= 0.1) {
                        this.particles[
                            this.particles.length - 1
                        ].hasImpacted = true;
                        this.createImpactEffect(arrow.position);
                        arrow.visible = false;
                    }
                }
            }
        });

        this.scene.add(arrow);
    }

    createImpactEffect(position) {
        const particles = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({
                color: 0x8b4513,
                size: 0.1,
                transparent: true,
                opacity: 0.8
            })
        );

        const particleCount = 10;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = position.x + (Math.random() - 0.5) * 0.5;
            positions[i + 1] = position.y;
            positions[i + 2] = position.z + (Math.random() - 0.5) * 0.5;
        }

        particles.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        this.particles.push({
            mesh: particles,
            life: 0.5,
            update: (delta) => {
                particles.material.opacity -= delta * 2;
                const positions = particles.geometry.attributes.position.array;
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] += delta;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }
        });

        this.scene.add(particles);
    }
}
