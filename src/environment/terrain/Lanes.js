import * as THREE from 'three';

export class Lanes {
    constructor() {
        this.lanes = [];
        this.createLanes();
    }

    createLanes() {
        const laneMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            side: THREE.DoubleSide
        });

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
        });

        return this.lanes;
    }

    createLanePath(startX, startZ, endX, endZ, controlPoint) {
        return [
            new THREE.Vector3(startX, 0, startZ),
            new THREE.Vector3(startX + controlPoint, 0, startZ + controlPoint),
            new THREE.Vector3(endX - controlPoint, 0, endZ - controlPoint),
            new THREE.Vector3(endX, 0, endZ)
        ];
    }
}
