import * as THREE from 'three';

export class Lanes {
    constructor() {
        this.lanes = [];
        this.createLanes();
    }

    createLanes() {
        // Create dirt path material with texture
        const laneMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b4513, // Saddle brown color for dirt
            shininess: 0,
            specular: 0x000000,
            side: THREE.DoubleSide,
            bumpScale: 0.2,
            displacementScale: 0.1
        });

        const lanesPaths = [
            this.createLanePath(-22, -22, 22, 22, 0), // Mid path through forest
            this.createLanePath(-22, -22, 22, -22, -15), // Northern forest path
            this.createLanePath(-22, -22, -22, 22, 15) // Southern forest path
        ];

        lanesPaths.forEach((points) => {
            // Create main dirt path
            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(
                curve,
                64, // Path segments
                2, // Path width
                12, // Radial segments for more natural edges
                false
            );

            // Create the dirt path
            const lane = new THREE.Mesh(geometry, laneMaterial);

            // Slightly sink the path into the ground to blend better
            lane.position.y = 0.05;
            lane.receiveShadow = true;

            // Add path edges (small displacement for natural look)
            this.addPathEdges(lane, points);

            this.lanes.push(lane);
        });

        return this.lanes;
    }

    addPathEdges(lane, points) {
        // Create scattered rocks and grass along path edges
        const edgeMaterial = new THREE.MeshPhongMaterial({
            color: 0x465536, // Dark green for vegetation
            shininess: 0,
            specular: 0x000000
        });

        points.forEach((point, index) => {
            if (index === 0 || index === points.length - 1) return;

            // Add random vegetation clusters
            for (let i = 0; i < 3; i++) {
                const offset = (Math.random() - 0.5) * 2;
                const size = 0.3 + Math.random() * 0.4;

                const edgeGeometry = new THREE.SphereGeometry(size, 4, 4);
                const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);

                edge.position.set(point.x + offset, 0.1, point.z + offset);

                edge.rotation.y = Math.random() * Math.PI;
                edge.rotation.x = Math.random() * 0.3;

                this.lanes.push(edge);
            }
        });
    }

    createLanePath(startX, startZ, endX, endZ, controlPoint) {
        // Add more control points for natural winding
        const points = [];
        points.push(new THREE.Vector3(startX, 0, startZ));

        // Add some random displacement to middle points for natural curves
        const segments = 3;
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const x =
                startX +
                (endX - startX) * t +
                controlPoint * Math.sin(t * Math.PI);
            const z =
                startZ +
                (endZ - startZ) * t +
                controlPoint * Math.cos(t * Math.PI);
            points.push(
                new THREE.Vector3(
                    x + (Math.random() - 0.5) * 2,
                    0,
                    z + (Math.random() - 0.5) * 2
                )
            );
        }

        points.push(new THREE.Vector3(endX, 0, endZ));
        return points;
    }
}
