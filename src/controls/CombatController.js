import * as THREE from 'three';
export class CombatController {
    constructor(player, environment, scene) {
        this.player = player;
        this.environment = environment;
        this.scene = scene;
    }

    handleAttack(target) {
        this.player.champion.attack();

        const worldPosition = new THREE.Vector3();
        target.getWorldPosition(worldPosition);
        this.createHitEffect(worldPosition);

        if (target.parent?.userData.type === 'monster') {
            this.handleMonsterAttack(target);
        } else if (target.userData.isDestructible) {
            this.handleDestructibleAttack(target);
        }
    }

    handleMonsterAttack(target) {
        const monster = target.parent?.userData.parent;
        if (monster.isAlive) {
            monster.takeDamage(this.player.champion.attackDamage);
        }
    }

    handleDestructibleAttack(target) {
        const destructibleGroup = target.userData.parentGroup;
        if (destructibleGroup?.userData.health > 0) {
            this.applyDamage(destructibleGroup, target);
        }
    }

    applyDamage(destructibleGroup) {
        destructibleGroup.userData.health -= this.player.champion.attackDamage;

        if (destructibleGroup.userData.health <= 0) {
            const event = new CustomEvent('destructibleDestroyed', {
                detail: { destructibleGroup }
            });
            document.dispatchEvent(event);
        }
    }

    createHitEffect(position) {
        // Create a particle burst effect
        const particleCount = 8;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                new THREE.MeshPhongMaterial({
                    color: 0xff4400,
                    emissive: 0xff2200,
                    emissiveIntensity: 1,
                    transparent: true,
                    opacity: 0.8
                })
            );

            // Set initial position
            particle.position.copy(position);

            // Random direction for particle
            const angle = ((Math.PI * 2) / particleCount) * i;
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * 5,
                3,
                Math.sin(angle) * 5
            );

            particles.push(particle);
            this.scene.add(particle);
        }

        // Animate particles
        let elapsed = 0;
        const animate = () => {
            elapsed += 0.016; // Approximate delta time

            particles.forEach((particle) => {
                // Update position
                particle.position.x += particle.velocity.x * 0.016;
                particle.position.y += particle.velocity.y * 0.016;
                particle.position.z += particle.velocity.z * 0.016;

                // Apply gravity
                particle.velocity.y -= 9.8 * 0.016;

                // Fade out
                particle.material.opacity = Math.max(0, 0.8 * (1 - elapsed));
                particle.scale.multiplyScalar(0.95);
            });

            if (elapsed < 1) {
                requestAnimationFrame(animate);
            } else {
                // Clean up particles
                particles.forEach((particle) => {
                    this.scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
            }
        };

        animate();
    }

    isTargetInRange(targetPosition) {
        const playerPos = this.player.getPosition();
        const distance = Math.sqrt(
            Math.pow(playerPos.x - targetPosition.x, 2) +
                Math.pow(playerPos.z - targetPosition.z, 2)
        );
        return distance <= this.player.champion.attackRange;
    }
}
