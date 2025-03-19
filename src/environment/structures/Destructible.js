import * as THREE from 'three';

export class Destructible {
    constructor(position, config) {
        this.mesh = this.createMesh(config);
        this.mesh.position.copy(position);
        this.mesh.position.y = 0.5;
        this.health = 100;
    }

    createMesh() {
        // This should be overridden by child classes
        throw new Error('createMesh must be implemented by child class');
    }

    takeDamage(amount) {
        this.health -= amount;
        this.mesh.userData.health = this.health;

        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        const destroyEvent = new CustomEvent('destructibleDestroyed', {
            detail: { destructibleGroup: this.mesh }
        });
        document.dispatchEvent(destroyEvent);
    }
}
