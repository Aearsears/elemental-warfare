import * as THREE from 'three';

export class HoverEffect {
    constructor(scene) {
        this.scene = scene;
        this.outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.BackSide
        });
        this.currentOutline = null;
        this.targetObject = null;
    }

    addOutline(object) {
        if (this.targetObject === object) return;
        this.removeOutline();

        // Create outline mesh
        const outlineGeometry = object.geometry.clone();
        const outlineMesh = new THREE.Mesh(
            outlineGeometry,
            this.outlineMaterial
        );

        // Scale it slightly larger
        outlineMesh.scale.multiplyScalar(1.05);

        // Copy position and rotation
        outlineMesh.position.copy(object.position);
        outlineMesh.rotation.copy(object.rotation);

        // Add to object
        object.add(outlineMesh);

        this.currentOutline = outlineMesh;
        this.targetObject = object;
    }

    removeOutline() {
        if (this.currentOutline && this.targetObject) {
            this.targetObject.remove(this.currentOutline);
            this.currentOutline = null;
            this.targetObject = null;
        }
    }
}
