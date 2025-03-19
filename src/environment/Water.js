import * as THREE from 'three';

export class Water {
    constructor() {
        this.mesh = this.createRiver();
        this.time = 0;
    }

    createRiver() {
        const riverGroup = new THREE.Group();

        // Create wider river path with curves
        const riverShape = new THREE.Shape();
        riverShape.moveTo(-25, -8); // Wider starting point
        riverShape.quadraticCurveTo(0, -2, 25, 8); // Wider curve
        riverShape.lineTo(25, -8); // Wider end point
        riverShape.quadraticCurveTo(0, -18, -25, -24); // Wider return curve
        riverShape.lineTo(-25, -8); // Close the shape

        // Increase segments for smoother waves and better detail
        const riverGeometry = new THREE.ShapeGeometry(riverShape, 128);
        const riverMaterial = new THREE.MeshPhongMaterial({
            color: 0x4477ff, // Slightly adjusted blue color
            transparent: true,
            opacity: 0.7, // Increased opacity
            shininess: 100,
            side: THREE.DoubleSide,
            specular: 0xffffff // Add specular highlight
        });

        const river = new THREE.Mesh(riverGeometry, riverMaterial);
        river.rotation.x = -Math.PI / 2;
        river.position.y = 0.1; // Raised slightly higher

        this.river = river;
        this.setupWaterAnimation();

        // Add underwater effect
        const underwaterGeometry = riverGeometry.clone();
        const underwaterMaterial = new THREE.MeshPhongMaterial({
            color: 0x224477,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const underwater = new THREE.Mesh(
            underwaterGeometry,
            underwaterMaterial
        );
        underwater.position.y = 0.05;
        underwater.rotation.x = -Math.PI / 2;
        riverGroup.add(underwater);
        riverGroup.add(river);

        return riverGroup;
    }

    setupWaterAnimation() {
        const vertices = this.river.geometry.attributes.position.array;
        this.originalVertices = [...vertices];
    }

    update(delta) {
        this.time += delta;
        const vertices = this.river.geometry.attributes.position.array;

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];

            // Enhanced wave pattern
            vertices[i + 1] =
                Math.sin(this.time * 1.5 + x * 0.3) * 0.15 + // Increased amplitude
                Math.cos(this.time * 2 + z * 0.3) * 0.15 + // Added second wave
                Math.sin(this.time * 3 + (x + z) * 0.2) * 0.1; // Added diagonal wave
        }

        this.river.geometry.attributes.position.needsUpdate = true;
    }
}
