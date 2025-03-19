import * as THREE from 'three';

export class Lanes {
    constructor() {
        this.lanes = [];
        this.createLanes();
    }

    createLanes() {
        const laneMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b4513, // Saddle brown color for dirt
            shininess: 0,
            specular: 0x000000,
            side: THREE.DoubleSide
        });

        const lanesPaths = [
            this.createLanePath(-22, -22, 22, 22, 0), // Mid path through forest
            this.createLanePath(-22, -22, 22, -22, -15), // Northern forest path
            this.createLanePath(-22, -22, -22, 22, 15) // Southern forest path
        ];

        lanesPaths.forEach((points) => {
            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.PlaneGeometry(2, curve.getLength());
            const lane = new THREE.Mesh(geometry, laneMaterial);

            // Position the lane
            const startPoint = points[0];
            const endPoint = points[points.length - 1];
            lane.position.set(
                (startPoint.x + endPoint.x) / 2,
                0.01, // Slightly above ground
                (startPoint.z + endPoint.z) / 2
            );

            // Rotate the lane to match path direction
            lane.lookAt(endPoint.x, 0.01, endPoint.z);
            lane.rotation.x = -Math.PI / 2; // Make it flat

            lane.receiveShadow = true;
            this.lanes.push(lane);
        });
    }

    getLanes() {
        return this.lanes;
    }

    createLanePath(startX, startZ, endX, endZ, controlPoint) {
        const points = [];
        points.push(new THREE.Vector3(startX, 0, startZ));

        const segments = 3;
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            points.push(new THREE.Vector3(x, 0, z));
        }

        points.push(new THREE.Vector3(endX, 0, endZ));
        return points;
    }
}
