import * as THREE from 'three';

export class Tree {
    constructor(position) {
        this.mesh = this.createTree();
        this.mesh.position.copy(position);

        // Add collision data
        this.mesh.userData.isCollidable = true;
        this.mesh.userData.type = 'tree';

        // Create collision cylinder
        const collisionGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
        const collisionMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        this.collisionMesh = new THREE.Mesh(
            collisionGeometry,
            collisionMaterial
        );
        this.mesh.add(this.collisionMesh);
    }

    createTree() {
        // Create tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4a2f21 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        trunk.receiveShadow = true;

        // Create tree leaves
        const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5a27 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 2;
        leaves.castShadow = true;
        leaves.receiveShadow = true;

        // Group trunk and leaves
        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        treeGroup.add(leaves);

        return treeGroup;
    }
}
