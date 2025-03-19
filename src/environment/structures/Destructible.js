import * as THREE from 'three';

export class Destructible {
    constructor(position) {
        this.mesh = this.createMesh();
        this.mesh.position.copy(position);
        this.mesh.position.y = 0.5;
        this.health = 100;
    }

    createMesh() {
        const group = new THREE.Group();

        // Create barrel/crate
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 30,
            specular: 0x444444
        });

        const barrel = new THREE.Mesh(geometry, material);
        barrel.castShadow = true;
        barrel.receiveShadow = true;

        // Mark both the group and the mesh as targetable
        group.userData.isDestructible = true;
        group.userData.health = this.health;
        barrel.userData.isTargetable = true;
        barrel.userData.isDestructible = true;
        barrel.userData.parentGroup = group;

        group.add(barrel);
        return group;
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
