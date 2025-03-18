import { Ability } from '../Ability.js';
import * as THREE from 'three';

export class PrecisionStrike extends Ability {
    constructor() {
        super({
            name: 'Precision Strike',
            cooldown: 90,
            manaCost: 100
        });
        this.chargeTime = 1.5;
        this.maxChargeTime = 2.0;
        this.charging = false;
        this.chargeEffects = [];
        this.chargeInterval = null;
        this.arrows = []; // Track active arrows
    }

    use(champion) {
        if (super.use(champion)) {
            this.charging = true;
            this.chargeStart = Date.now();
            this.createChargeEffect(champion);

            // Store interval reference
            this.chargeInterval = setInterval(() => {
                if (!this.charging) {
                    this.cleanupChargeEffects();
                    clearInterval(this.chargeInterval);
                    return;
                }

                const chargeProgress = this.getChargeProgress();
                if (chargeProgress >= 1) {
                    this.releaseShot(champion, 1);
                    this.charging = false;
                    this.cleanupChargeEffects();
                    clearInterval(this.chargeInterval);
                }
            }, 100);

            // Listen for key release
            const keyUpHandler = (event) => {
                if (event.key.toUpperCase() === 'R' && this.charging) {
                    this.charging = false;
                    document.removeEventListener('keyup', keyUpHandler);
                    clearInterval(this.chargeInterval);

                    const chargeProgress = this.getChargeProgress();
                    if (chargeProgress >= 0.2) {
                        this.releaseShot(champion, chargeProgress);
                    }
                    this.cleanupChargeEffects();
                }
            };
            document.addEventListener('keyup', keyUpHandler);

            return true;
        }
        return false;
    }

    cleanupChargeEffects() {
        this.chargeEffects.forEach((effect) => {
            this.scene.remove(effect.mesh);
        });
        this.chargeEffects = [];
    }

    getChargeProgress() {
        return Math.min(
            (Date.now() - this.chargeStart) / (this.chargeTime * 1000),
            1
        );
    }

    createChargeEffect(champion) {
        // Create energy rings
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.5 + i * 0.2, 0.6 + i * 0.2, 32),
                new THREE.MeshPhongMaterial({
                    color: 0xffff00,
                    emissive: 0xffaa00,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide
                })
            );

            ring.rotation.x = Math.PI / 2;
            ring.position.copy(champion.getPosition());
            ring.position.y += 1;

            this.chargeEffects.push({
                mesh: ring,
                baseScale: new THREE.Vector3(1, 1, 1)
            });
            this.scene.add(ring);
        }
    }

    releaseShot(champion, chargeProgress) {
        // Create arrow mesh
        const arrow = this.createPowerfulArrow(champion, chargeProgress);
        arrow.position.copy(champion.getPosition());
        arrow.position.y += 1.5;
        arrow.rotation.copy(champion.mesh.rotation);

        // Calculate direction and velocity
        const direction = new THREE.Vector3(0, 0, 1)
            .applyQuaternion(champion.mesh.quaternion)
            .normalize();

        // Store velocity in closure
        const velocity = direction.multiplyScalar(40 * chargeProgress);

        // Create particle with fixed velocity
        const particle = {
            mesh: arrow,
            life: 2,
            hasImpacted: false,
            update: (delta) => {
                if (!particle.hasImpacted) {
                    const movement = velocity.clone().multiplyScalar(delta);
                    arrow.position.add(movement);
                    this.createPowerTrail(arrow.position, chargeProgress);
                }
            }
        };

        this.particles.push(particle);
        this.scene.add(arrow);
    }

    update(delta) {
        // Update charge effects
        if (this.charging) {
            const chargeProgress = this.getChargeProgress();
            this.chargeEffects.forEach((effect) => {
                const scale = 1 + chargeProgress * 0.5;
                effect.mesh.scale.set(scale, scale, scale);
            });
        }

        // Update particles (instead of arrows)
        super.update(delta);
    }

    createPowerfulArrow(champion, chargeProgress) {
        const arrow = new THREE.Group();

        // Glowing arrow head
        const head = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 0.6, 8),
            new THREE.MeshPhongMaterial({
                color: 0xffff00,
                emissive: 0xffaa00,
                emissiveIntensity: chargeProgress
            })
        );
        head.position.y = 0.6;
        arrow.add(head);

        // Energy shaft
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1.2),
            new THREE.MeshPhongMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.8
            })
        );
        shaft.position.y = 0.1;
        arrow.add(shaft);

        arrow.position.copy(champion.getPosition());
        arrow.position.y += 1.5;
        arrow.rotation.copy(champion.mesh.rotation);

        return arrow;
    }

    createPowerTrail(position, chargeProgress) {
        const particleCount = Math.floor(10 * chargeProgress);
        const trail = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({
                color: 0xffaa00,
                size: 0.2 * chargeProgress,
                transparent: true,
                opacity: 0.6,
                map: this.createTrailTexture()
            })
        );

        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = position.x + (Math.random() - 0.5) * 0.3;
            positions[i + 1] = position.y + (Math.random() - 0.5) * 0.3;
            positions[i + 2] = position.z + (Math.random() - 0.5) * 0.3;
        }

        trail.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        this.particles.push({
            mesh: trail,
            life: 0.5,
            update: (delta) => {
                trail.material.opacity -= delta;
                const positions = trail.geometry.attributes.position.array;
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] += delta * 2;
                }
                trail.geometry.attributes.position.needsUpdate = true;
            }
        });

        this.scene.add(trail);
    }

    createTrailTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');

        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
}
