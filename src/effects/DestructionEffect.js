import * as THREE from 'three';

export class DestructionEffect {
    constructor(scene) {
        this.scene = scene;
    }

    create(position) {
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.2, 0.2),
                new THREE.MeshPhongMaterial({
                    color: 0x8b4513,
                    emissive: 0x3d2008,
                    emissiveIntensity: 0.5
                })
            );

            particle.position.copy(position);

            // Random direction for particle
            const angle = ((Math.PI * 2) / particleCount) * i;
            const speed = 2 + Math.random() * 3;
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                4 + Math.random() * 2,
                Math.sin(angle) * speed
            );

            this.scene.add(particle);

            // Animate particle
            let elapsed = 0;
            const animate = () => {
                elapsed += 0.016;

                // Update position
                particle.position.x += particle.velocity.x * 0.016;
                particle.position.y += particle.velocity.y * 0.016;
                particle.position.z += particle.velocity.z * 0.016;

                // Apply gravity
                particle.velocity.y -= 9.8 * 0.016;

                // Rotate particle
                particle.rotation.x += 0.1;
                particle.rotation.y += 0.1;

                // Fade out
                particle.material.opacity = Math.max(0, 1 - elapsed);
                particle.scale.multiplyScalar(0.97);

                if (elapsed < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                }
            };

            animate();
        }
    }
}
