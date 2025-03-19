import * as THREE from 'three';
import { Monster } from '../environment/jungle/Monster.js';

export class HoverEffect {
    constructor(scene) {
        this.scene = scene;
        this.outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.BackSide
        });
        this.currentOutlines = [];
        this.targetObject = null;
    }

    addOutline(object) {
        if (this.targetObject === object) return;
        this.removeOutline();

        const monster = object.parent?.userData.parent;
        if (monster && monster instanceof Monster) {
            // For monsters, outline the entire monster group
            object.parent.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const outlineGeometry = child.geometry.clone();
                    const outlineMesh = new THREE.Mesh(
                        outlineGeometry,
                        this.outlineMaterial
                    );

                    // Scale slightly larger
                    outlineMesh.scale.multiplyScalar(1.05);

                    // Copy position and rotation
                    outlineMesh.position.copy(child.position);
                    outlineMesh.rotation.copy(child.rotation);
                    outlineMesh.quaternion.copy(child.quaternion);
                    outlineMesh.matrix.copy(child.matrix);
                    outlineMesh.matrixWorld.copy(child.matrixWorld);

                    // Add to the same parent as the original mesh
                    child.parent.add(outlineMesh);
                    this.currentOutlines.push(outlineMesh);
                }
            });
        } else {
            // For other objects, use the existing single outline logic
            const outlineGeometry = object.geometry.clone();
            const outlineMesh = new THREE.Mesh(
                outlineGeometry,
                this.outlineMaterial
            );

            outlineMesh.scale.multiplyScalar(1.05);
            outlineMesh.position.copy(object.position);
            outlineMesh.rotation.copy(object.rotation);
            object.add(outlineMesh);
            this.currentOutlines.push(outlineMesh);
        }

        this.targetObject = object;
    }

    removeOutline() {
        if (this.currentOutlines.length > 0) {
            this.currentOutlines.forEach((outline) => {
                if (outline.parent) {
                    outline.parent.remove(outline);
                }
            });
            this.currentOutlines = [];
            this.targetObject = null;
        }
    }
}
