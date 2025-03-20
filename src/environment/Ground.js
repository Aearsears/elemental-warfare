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
        // Remove ring rotation since it inherits from parent mesh
        this.ring.receiveShadow = true;
        this.mesh.add(this.ring);

        // Add boundary trees
        this.addBoundaryTrees();
    }

    addBoundaryTrees() {
        // todo : fix trees in the air
        const treeCount = 60;
        const treeSpacing = (2 * Math.PI) / treeCount;

        // Create a container for trees that will match ground rotation
        const treeContainer = new THREE.Group();

        for (let i = 0; i < treeCount; i++) {
            const angle = i * treeSpacing;
            // Use radius + 1 to place trees just outside the ring
            const x = (this.radius + 1) * Math.cos(angle);
            const z = (this.radius + 1) * Math.sin(angle);

            const randOffset = Math.random() * 0.5 - 0.25; // Reduced offset for tighter spacing
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
            leaves.position.y = 2.5 * randScale;
            leaves.castShadow = true;
            leaves.receiveShadow = true;

            // Create tree group
            const treeGroup = new THREE.Group();
            treeGroup.add(trunk);
            treeGroup.add(leaves);

            // Position tree group
            treeGroup.position.set(
                x + randOffset * Math.cos(angle),
                0,
                z + randOffset * Math.sin(angle)
            );

            // Add to container
            treeContainer.add(treeGroup);
        }

        // Add tree container to ground mesh
        this.mesh.add(treeContainer);
    }

    addScatteredTrees() {
        const treeCount = 100; // Number of random trees
        const minDistance = 15; // Minimum distance from center
        const maxDistance = this.radius - 5; // Maximum distance from center

        for (let i = 0; i < treeCount; i++) {
            // Random position in polar coordinates
            const angle = Math.random() * Math.PI * 2;
            const distance =
                minDistance + Math.random() * (maxDistance - minDistance);

            // Convert to Cartesian coordinates
            const x = distance * Math.cos(angle);
            const z = distance * Math.sin(angle);

            const randScale = 0.6 + Math.random() * 0.8;

            // Create tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(
                0.2 * randScale,
                0.3 * randScale,
                1.5 * randScale,
                8
            );
            const trunkMaterial = new THREE.MeshPhongMaterial({
                color: 0x4a2f21
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.castShadow = true;
            trunk.receiveShadow = true;

            // Create tree leaves
            const leavesGeometry = new THREE.ConeGeometry(
                1.2 * randScale,
                2.5 * randScale,
                8
            );
            const leavesMaterial = new THREE.MeshPhongMaterial({
                color: 0x2d5a27
            });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 2 * randScale;
            leaves.castShadow = true;
            leaves.receiveShadow = true;

            // Create tree group
            const treeGroup = new THREE.Group();
            treeGroup.add(trunk);
            treeGroup.add(leaves);

            // Position tree group with random rotation
            treeGroup.position.set(x, 0, z);
            treeGroup.rotation.y = Math.random() * Math.PI * 2;

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
