import * as THREE from 'three';

export class Ground {
    constructor(radius = 50) {
        // Increased radius for bigger map
        this.radius = radius;

        // Create circular ground
        const groundGeometry = new THREE.CircleGeometry(radius, 64);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x228b22,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.receiveShadow = true;

        // Add outer ring
        const ringGeometry = new THREE.RingGeometry(radius, radius + 2, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a6b1a,
            side: THREE.DoubleSide
        });
        this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ring.rotation.x = -Math.PI / 2;
        this.ring.receiveShadow = true;
        this.mesh.add(this.ring);

        // Add boundary trees
        this.addBoundaryTrees();
    }

    addBoundaryTrees() {
        const treeCount = 60; // Number of trees around the boundary
        const treeSpacing = (2 * Math.PI) / treeCount;

        for (let i = 0; i < treeCount; i++) {
            const angle = i * treeSpacing;
            const x = (this.radius - 2) * Math.cos(angle);
            const z = (this.radius - 2) * Math.sin(angle);

            // Add random offset to make it look more natural
            const randOffset = Math.random() * 1 - 0.5;
            const randScale = 0.8 + Math.random() * 0.4;

            const treeGeometry = new THREE.CylinderGeometry(
                0,
                1.5 * randScale,
                4 * randScale,
                8
            );
            const treeMaterial = new THREE.MeshPhongMaterial({
                color: 0x2d5a27
            });
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);

            tree.position.set(
                x + randOffset * Math.cos(angle + Math.PI / 2),
                2 * randScale,
                z + randOffset * Math.sin(angle + Math.PI / 2)
            );

            tree.castShadow = true;
            tree.receiveShadow = true;
            this.mesh.add(tree);
        }
    }

    getMesh() {
        return this.mesh;
    }

    getRadius() {
        return this.radius;
    }
}
