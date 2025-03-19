import * as THREE from 'three';

export class MovementController {
    constructor(player, collisionManager, speed = 0.2) {
        this.player = player;
        this.collisionManager = collisionManager;
        this.playerSpeed = speed;
        this.targetPosition = null;
        this.isMoving = false;
    }

    setTargetPosition(position) {
        // Ensure target position is on the ground plane
        this.targetPosition = new THREE.Vector3(
            position.x,
            0, // Lock to ground level
            position.z
        );
        this.isMoving = true;
    }

    update() {
        if (!this.isMoving) return;

        const currentPos = this.player.getPosition();
        const direction = this.targetPosition.clone().sub(currentPos);

        // Stop if we're close enough
        if (direction.length() < 0.1) {
            this.isMoving = false;
            return;
        }

        // Normalize and scale by speed
        direction.normalize().multiplyScalar(this.playerSpeed);

        // Store original position before attempting move
        const originalPosition = currentPos.clone();
        const newPosition = currentPos.clone().add(direction);

        // Set new position
        this.player.setPosition(newPosition.x, newPosition.y, newPosition.z);

        // Check for collisions
        if (this.collisionManager.checkCollisions(this.player)) {
            // Try to slide along obstacles
            const adjustedPosition = this.handleCollision(
                direction,
                newPosition,
                originalPosition
            );

            // If we couldn't slide, return to original position
            if (adjustedPosition.equals(originalPosition)) {
                this.isMoving = false;
            }

            // Update to adjusted position
            this.player.setPosition(
                adjustedPosition.x,
                adjustedPosition.y,
                adjustedPosition.z
            );
        }
    }

    handleMovement(direction) {
        const newPosition = this.player.getPosition().clone();
        const movement = direction.normalize().multiplyScalar(this.playerSpeed);
        let adjustedPosition = newPosition.clone().add(movement);
        const originalPosition = this.player.getPosition().clone();

        this.player.setPosition(
            adjustedPosition.x,
            adjustedPosition.y,
            adjustedPosition.z
        );

        if (this.collisionManager.checkCollisions(this.player)) {
            adjustedPosition = this.handleCollision(
                movement,
                newPosition,
                originalPosition
            );
        }

        this.player.setPosition(
            adjustedPosition.x,
            adjustedPosition.y,
            adjustedPosition.z
        );
        this.player.setMoving(
            adjustedPosition.distanceTo(originalPosition) > 0.01
        );
    }

    handleCollision(movement, newPosition, originalPosition) {
        // Try sliding along both possible directions
        const slideDirections = [
            new THREE.Vector3(-movement.z, 0, movement.x), // Slide right
            new THREE.Vector3(movement.z, 0, -movement.x) // Slide left
        ];

        // Return player to original position first
        this.player.setPosition(
            originalPosition.x,
            originalPosition.y,
            originalPosition.z
        );

        // Try each slide direction
        for (const slideDir of slideDirections) {
            const slideMovement = slideDir
                .normalize()
                .multiplyScalar(this.playerSpeed);
            const slidePosition = originalPosition.clone().add(slideMovement);

            // Test slide position
            this.player.setPosition(
                slidePosition.x,
                slidePosition.y,
                slidePosition.z
            );

            if (!this.collisionManager.checkCollisions(this.player)) {
                return slidePosition;
            }

            // Reset position for next attempt
            this.player.setPosition(
                originalPosition.x,
                originalPosition.y,
                originalPosition.z
            );
        }

        // If no valid slide found, return original position
        return originalPosition;
    }

    finalizeMovement() {
        this.player.setPosition(
            this.targetPosition.x,
            this.player.getPosition().y,
            this.targetPosition.z
        );
        this.targetPosition = null;
        this.player.setMoving(false);
    }
}
