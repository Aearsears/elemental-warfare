import * as THREE from 'three';

export class Ground {
    constructor() {
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x228b22,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.receiveShadow = true;
    }

    getMesh() {
        return this.mesh;
    }
}
