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

        // Define tower positions for path connections
        const lanesPaths = [
            // Mid lane - connects base towers through mid towers
            this.createLanePath(-22, -22, -15, -5, 0), // Base to first tower
            this.createLanePath(-15, -5, 15, 5, 0), // First tower to second tower
            this.createLanePath(15, 5, 22, 22, 0), // Second tower to base

            // Top lane
            this.createLanePath(-22, -22, -15, -15, 0), // Base to first tower
            this.createLanePath(-15, -15, 15, -15, 0), // First tower to second tower
            this.createLanePath(15, -15, 22, -22, 0), // Second tower to base

            // Bottom lane
            this.createLanePath(-22, -22, -15, 15, 0), // Base to first tower
            this.createLanePath(-15, 15, 15, 15, 0), // First tower to second tower
            this.createLanePath(15, 15, 22, 22, 0) // Second tower to base
        ];

        lanesPaths.forEach((points) => {
            const curve = new THREE.CatmullRomCurve3(points);
            // Increased lane width from 3 to 6 units
            const geometry = new THREE.PlaneGeometry(6, curve.getLength());
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

        // Create smoother paths with more segments
        const segments = 5;
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
