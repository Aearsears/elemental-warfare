import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.trees = [];
        this.structures = [];
        this.lanes = [];

        // Create map elements
        this.createBases();
        this.createLanes();
        this.createTowers();
        this.createJungle();
    }

    createBases() {
        // Create two bases (blue and red side)
        const basePositions = [
            { pos: new THREE.Vector3(-22, 0, -22), color: 0x0044ff }, // Blue base
            { pos: new THREE.Vector3(22, 0, 22), color: 0xff0000 } // Red base
        ];

        basePositions.forEach((base) => {
            const baseGroup = new THREE.Group();

            // Main structure
            const baseGeometry = new THREE.CylinderGeometry(5, 6, 4, 8);
            const baseMaterial = new THREE.MeshPhongMaterial({
                color: base.color
            });
            const baseStructure = new THREE.Mesh(baseGeometry, baseMaterial);
            baseStructure.position.y = 2;
            baseStructure.castShadow = true;
            baseStructure.receiveShadow = true;

            // Base platform
            const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 8);
            const platformMaterial = new THREE.MeshPhongMaterial({
                color: 0x666666
            });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.y = 0.25;
            platform.receiveShadow = true;

            baseGroup.add(baseStructure);
            baseGroup.add(platform);
            baseGroup.position.copy(base.pos);
            this.scene.add(baseGroup);
        });
    }

    createLanes() {
        const laneMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            side: THREE.DoubleSide
        });

        // Create curved lanes using custom geometry
        const lanesPaths = [
            this.createLanePath(-22, -22, 22, 22, 0), // Mid lane
            this.createLanePath(-22, -22, 22, -22, -15), // Top lane
            this.createLanePath(-22, -22, -22, 22, 15) // Bottom lane
        ];

        lanesPaths.forEach((points) => {
            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, 64, 1.5, 8, false);
            const lane = new THREE.Mesh(geometry, laneMaterial);
            lane.position.y = 0.1;
            lane.receiveShadow = true;
            this.lanes.push(lane);
            this.scene.add(lane);
        });
    }

    createLanePath(startX, startZ, endX, endZ, controlPoint) {
        return [
            new THREE.Vector3(startX, 0, startZ),
            new THREE.Vector3(startX + controlPoint, 0, startZ + controlPoint),
            new THREE.Vector3(endX - controlPoint, 0, endZ - controlPoint),
            new THREE.Vector3(endX, 0, endZ)
        ];
    }

    createTower(position, teamColor) {
        const towerGroup = new THREE.Group();

        // Tower base
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 1, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;

        // Tower body
        const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 6, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: teamColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 4;

        // Tower top
        const topGeometry = new THREE.ConeGeometry(1.2, 2, 8);
        const topMaterial = new THREE.MeshPhongMaterial({ color: teamColor });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 8;

        towerGroup.add(base);
        towerGroup.add(body);
        towerGroup.add(top);
        towerGroup.position.copy(position);
        towerGroup.castShadow = true;
        towerGroup.receiveShadow = true;

        return towerGroup;
    }

    createTowers() {
        const blueTowers = [
            { x: -15, z: -15 }, // Top lane
            { x: -15, z: 0 }, // Mid lane
            { x: 0, z: -15 } // Bottom lane
        ];

        const redTowers = [
            { x: 15, z: 15 }, // Top lane
            { x: 15, z: 0 }, // Mid lane
            { x: 0, z: 15 } // Bottom lane
        ];

        blueTowers.forEach((pos) => {
            const tower = this.createTower(
                new THREE.Vector3(pos.x, 0, pos.z),
                0x0044ff
            );
            this.structures.push(tower);
            this.scene.add(tower);
        });

        redTowers.forEach((pos) => {
            const tower = this.createTower(
                new THREE.Vector3(pos.x, 0, pos.z),
                0xff0000
            );
            this.structures.push(tower);
            this.scene.add(tower);
        });
    }

    createJungle() {
        // Create jungle camps and decorative elements
        const jungleCamps = [
            { x: -10, z: 5 },
            { x: 10, z: -5 },
            { x: 0, z: 10 },
            { x: 0, z: -10 }
        ];

        jungleCamps.forEach((camp) => {
            const radius = 3;
            const treeCount = 6;

            // Create circle of trees around camp
            for (let i = 0; i < treeCount; i++) {
                const angle = (i / treeCount) * Math.PI * 2;
                const x = camp.x + Math.cos(angle) * radius;
                const z = camp.z + Math.sin(angle) * radius;
                const tree = this.createTree(x, z);
                this.trees.push(tree);
                this.scene.add(tree);
            }
        });
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

    update(delta) {
        // Animate structures (towers, etc.)
        this.structures.forEach((structure) => {
            const top = structure.children[2];
            top.rotation.y += delta * 0.5;
        });
    }
}
