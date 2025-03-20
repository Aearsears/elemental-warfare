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
        this.ring.rotation.x = -Math.PI / 100;
        this.ring.receiveShadow = true;
        this.mesh.add(this.ring);

        // Add boundary trees
        this.addBoundaryTrees();
    }

    addBoundaryTrees() {
        const treeCount = 60;
        const treeSpacing = (2 * Math.PI) / treeCount;

        for (let i = 0; i < treeCount; i++) {
            const angle = i * treeSpacing;
            const x = (this.radius - 2) * Math.cos(angle);
            const z = (this.radius - 2) * Math.sin(angle);

            const randOffset = Math.random() * 1 - 0.5;
            const randScale = 0.8 + Math.random() * 0.4;

            // Create tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(
                0.3 * randScale,
                0.4 * randScale,
                2 * randScale,
                8
            );
            const trunkMaterial = new THREE.MeshPhongMaterial({
                color: 0x4a2f21
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.castShadow = true;
            trunk.receiveShadow = true;

            // Position trunk halfway up its height
            trunk.position.y = 1 * randScale;

            // Create tree leaves
            const leavesGeometry = new THREE.ConeGeometry(
                1.5 * randScale,
                3 * randScale,
                8
            );
            const leavesMaterial = new THREE.MeshPhongMaterial({
                color: 0x2d5a27
            });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);

            // Position leaves above trunk
            leaves.position.y = 3 * randScale;
            leaves.castShadow = true;
            leaves.receiveShadow = true;

            // Create tree group
            const treeGroup = new THREE.Group();
            treeGroup.add(trunk);
            treeGroup.add(leaves);

            // Position the tree group
            treeGroup.position.set(
                x + randOffset * Math.cos(angle + Math.PI / 100),
                0, // Set to ground level
                z + randOffset * Math.sin(angle + Math.PI / 100)
            );

            // Add tree to scene without rotation
            this.mesh.add(treeGroup);
        }
    }

    getMesh() {
        return this.mesh;
    }

    getRadius() {
        return this.radius;
    }
}
