import * as THREE from 'three';

export class HealthBar {
    constructor(maxHealth, width = 1, height = 0.1) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.width = width;
        this.height = height;

        // Create container for health bar
        this.container = new THREE.Group();

        // Background bar (red)
        const bgGeometry = new THREE.PlaneGeometry(width, height);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide
        });
        this.background = new THREE.Mesh(bgGeometry, bgMaterial);
        this.container.add(this.background);

        // Health bar (green)
        const healthGeometry = new THREE.PlaneGeometry(width, height);
        const healthMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide
        });
        this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        this.container.add(this.healthBar);

        // Make health bar face camera
        this.container.renderOrder = 999;
        this.background.renderOrder = 1000;
        this.healthBar.renderOrder = 1001;
    }

    update(health, camera) {
        // Update health bar scale
        const healthPercent = Math.max(0, Math.min(1, health / this.maxHealth));
        this.healthBar.scale.x = healthPercent;
        this.healthBar.position.x = (this.width * (healthPercent - 1)) / 2;

        // Make health bar face camera
        this.container.quaternion.copy(camera.quaternion);
    }

    remove() {
        // Remove meshes from container
        this.container.remove(this.background);
        this.container.remove(this.healthBar);

        // Dispose of geometries and materials
        this.background.geometry.dispose();
        this.background.material.dispose();
        this.healthBar.geometry.dispose();
        this.healthBar.material.dispose();

        // Remove container from parent if it exists
        if (this.container.parent) {
            this.container.parent.remove(this.container);
        }

        // Clear references
        this.background = null;
        this.healthBar = null;
        this.container = null;
    }
}
