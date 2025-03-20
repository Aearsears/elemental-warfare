import * as THREE from 'three';
import { NETWORK_CONFIG } from './config.js';

export class PositionInterpolator {
    constructor() {
        this.positions = [];
        this.lastUpdateTime = 0;
    }

    addPosition(position) {
        const timestamp = Date.now();
        this.positions.push({
            position: new THREE.Vector3(position.x, position.y, position.z),
            timestamp
        });

        // Keep only recent positions
        while (
            this.positions.length > 0 &&
            timestamp - this.positions[0].timestamp >
                NETWORK_CONFIG.MAX_EXTRAPOLATION_TIME
        ) {
            this.positions.shift();
        }
    }

    update(delta) {
        const now = Date.now() - NETWORK_CONFIG.INTERPOLATION_DELAY;

        // Find positions to interpolate between
        let p1 = null;
        let p2 = null;

        for (let i = 0; i < this.positions.length - 1; i++) {
            if (
                this.positions[i].timestamp <= now &&
                this.positions[i + 1].timestamp >= now
            ) {
                p1 = this.positions[i];
                p2 = this.positions[i + 1];
                break;
            }
        }

        if (!p1 || !p2) return null;

        // Calculate interpolation factor
        const total = p2.timestamp - p1.timestamp;
        const current = now - p1.timestamp;
        const alpha = current / total;

        // Interpolate position
        return new THREE.Vector3().lerpVectors(p1.position, p2.position, alpha);
    }
}
