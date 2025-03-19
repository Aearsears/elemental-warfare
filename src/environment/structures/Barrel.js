import * as THREE from 'three';
import { Destructible } from './Destructible.js';

export class Barrel extends Destructible {
    constructor(position) {
        super(position);
        this.health = 75; // Barrels have less health than default destructibles
    }

    createMesh() {
        const group = new THREE.Group();

        // Create barrel mesh
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
        const material = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 30,
            specular: 0x444444,
            map: this.createBarrelTexture()
        });

        const barrel = new THREE.Mesh(geometry, material);
        barrel.castShadow = true;
        barrel.receiveShadow = true;

        // Add metal rings
        const ringGeometry = new THREE.TorusGeometry(0.52, 0.05, 8, 24);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            shininess: 60,
            specular: 0x888888
        });

        // Add top and bottom rings
        const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
        topRing.rotation.x = Math.PI / 2;
        topRing.position.y = 0.4;

        const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
        bottomRing.rotation.x = Math.PI / 2;
        bottomRing.position.y = -0.4;

        // Mark components as targetable
        group.userData.isDestructible = true;
        group.userData.health = this.health;
        barrel.userData.isTargetable = true;
        barrel.userData.isDestructible = true;
        barrel.userData.parentGroup = group;

        // Add collision data
        const collisionGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        const collisionMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        this.collisionMesh = new THREE.Mesh(
            collisionGeometry,
            collisionMaterial
        );
        group.add(this.collisionMesh);

        group.add(barrel);
        group.add(topRing);
        group.add(bottomRing);

        return group;
    }

    createBarrelTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, 0, 512, 512);

        // Add wood grain effect
        ctx.strokeStyle = '#613009';
        ctx.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 30);
            ctx.bezierCurveTo(
                170,
                i * 30 + Math.random() * 20 - 10,
                340,
                i * 30 + Math.random() * 20 - 10,
                512,
                i * 30
            );
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 2);

        return texture;
    }

    destroy() {
        super.destroy();
        // Add barrel-specific destruction effects
        this.createExplosionEffect();
    }

    createExplosionEffect() {
        // Create particle effect for wood splinters
        const particleCount = 20;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.BoxGeometry(0.1, 0.05, 0.02);
            const material = new THREE.MeshPhongMaterial({
                color: 0x8b4513
            });
            const particle = new THREE.Mesh(geometry, material);

            particle.position.copy(this.mesh.position);
            particle.velocity = new THREE.Vector3(
                Math.random() * 2 - 1,
                Math.random() * 3,
                Math.random() * 2 - 1
            );

            particles.push(particle);
            this.mesh.parent.add(particle);
        }

        // Clean up particles after animation
        setTimeout(() => {
            particles.forEach((particle) => {
                particle.parent.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            });
        }, 2000);
    }
}
