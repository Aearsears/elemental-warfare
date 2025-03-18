import * as THREE from 'three';

export class Water {
    constructor() {
        this.mesh = this.createRiver();
    }

    createRiver() {
        const riverGroup = new THREE.Group();

        // Create main river path
        const riverShape = new THREE.Shape();
        riverShape.moveTo(-25, -5);
        riverShape.quadraticCurveTo(0, 0, 25, 5);
        riverShape.lineTo(25, -5);
        riverShape.quadraticCurveTo(0, -10, -25, -15);

        const riverGeometry = new THREE.ShapeGeometry(riverShape);
        const riverMaterial = new THREE.MeshPhongMaterial({
            color: 0x4444ff,
            transparent: true,
            opacity: 0.6,
            shininess: 100
        });

        const river = new THREE.Mesh(riverGeometry, riverMaterial);
        river.rotation.x = -Math.PI / 2;
        river.position.y = 0.05;

        // Add water animation
        this.addWaterAnimation(river);

        riverGroup.add(river);
        return riverGroup;
    }

    addWaterAnimation(river) {
        const vertices = river.geometry.attributes.position.array;
        this.originalVertices = [...vertices];

        this.update = (delta) => {
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i + 1] =
                    this.originalVertices[i + 1] +
                    Math.sin(Date.now() * 0.001 + vertices[i] * 0.1) * 0.1;
            }
            river.geometry.attributes.position.needsUpdate = true;
        };
    }
}
