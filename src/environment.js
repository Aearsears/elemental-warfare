import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.trees = [];
        this.createTrees(20);
    }

    createTree(x, z) {
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
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        // Position the tree
        tree.position.set(x, 0, z);
        return tree;
    }

    createTrees(count) {
        // Clear existing trees
        this.trees.forEach((tree) => this.scene.remove(tree));
        this.trees = [];

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;

            // Avoid center area
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;

            const tree = this.createTree(x, z);
            this.trees.push(tree);
            this.scene.add(tree);
        }
    }
}
