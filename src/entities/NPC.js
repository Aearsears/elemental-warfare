import * as THREE from 'three';
import { HealthBar } from '../ui/HealthBar.js';
import { Destructible } from '../environment/structures/Destructible.js';

export class NPC extends Destructible {
    constructor(config) {
        super(config.position);
        this._config = config; // Store config for createMesh
        this.health = config.health || 100;
        this.maxHealth = this.health;
        this.isAlive = true;
        this.mesh = this.createMesh();
        this.mesh.userData.type = 'npc';
        this.mesh.userData.parent = this;

        // Add health bar
        this.healthBar = new HealthBar(this.health);
        this.healthBar.container.position.y = 2;
        this.mesh.add(this.healthBar.container);
    }

    createMesh() {
        const group = new THREE.Group();

        // Create NPC body
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this._config?.color || 0xaaaaaa,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;

        group.add(body);
        return group;
    }

    takeDamage(amount) {
        if (!this.isAlive) return;
        super.takeDamage(amount);

        if (this.health > 0 && this.healthBar) {
            this.healthBar.update(this.health, window.camera);
        }
    }

    destroy() {
        if (!this.isAlive) return;
        this.isAlive = false;

        // Clean up health bar
        if (this.healthBar) {
            this.healthBar.remove();
            this.healthBar = null;
        }

        // Call parent destroy
        super.destroy();

        // Dispatch NPC-specific death event
        const deathEvent = new CustomEvent('npcDeath', {
            detail: { npc: this }
        });
        document.dispatchEvent(deathEvent);
    }

    update(delta) {
        if (!this.isAlive) return;

        if (this.healthBar) {
            this.healthBar.update(this.health, window.camera);
        }
    }
}
