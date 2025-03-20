import { Player } from './Player.js';
import { PositionInterpolator } from '../network/PositionInterpolator.js';

export class RemotePlayer extends Player {
    constructor(championType, scene) {
        super(championType, scene);
        this.interpolator = new PositionInterpolator();
        this.isInitialized = false;
        this.lastPosition = null;
    }

    updatePosition(newPosition) {
        if (!this.isInitialized && this.mesh) {
            console.log('moving remote player position:', newPosition);

            this.mesh.position.set(newPosition.x, newPosition.y, newPosition.z);
            this.lastPosition = newPosition;
            this.isInitialized = true;
            return;
        }

        // Only add position if it's different from last one
        if (
            !this.lastPosition ||
            this.lastPosition.x !== newPosition.x ||
            this.lastPosition.y !== newPosition.y ||
            this.lastPosition.z !== newPosition.z
        ) {
            this.interpolator.addPosition(newPosition);
            this.lastPosition = newPosition;
        }
    }

    updateRotation(newRotation) {
        if (!this.mesh) return;
        this.mesh.rotation.copy(newRotation);
    }

    update(delta) {
        if (!this.isInitialized || !this.mesh) return;

        const interpolatedPosition = this.interpolator.update(delta);
        if (interpolatedPosition) {
            this.mesh.position.copy(interpolatedPosition);
        }
        super.update(delta);
    }
}
