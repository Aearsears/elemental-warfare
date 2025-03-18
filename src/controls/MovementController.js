import * as THREE from 'three';

export class MovementController {
    constructor(player, collisionManager, speed = 0.2) {
        this.player = player;
        this.collisionManager = collisionManager;
        this.playerSpeed = speed;
        this.targetPosition = null;
    }

    setTargetPosition(position) {
        this.targetPosition = position;
    }

    update() {
        if (!this.targetPosition) {
            this.player.setMoving(false);
            return;
        }

        const direction = this.targetPosition
            .clone()
            .sub(this.player.getPosition());

        if (direction.length() > this.playerSpeed) {
            this.handleMovement(direction);
        } else {
            this.finalizeMovement();
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
        const slideDirections = [
            new THREE.Vector3(-movement.z, 0, movement.x),
            new THREE.Vector3(movement.z, 0, -movement.x)
        ];

        for (const slideDir of slideDirections) {
            const slideMovement = slideDir
                .normalize()
                .multiplyScalar(this.playerSpeed);
            const slidePosition = newPosition.clone().add(slideMovement);

            this.player.setPosition(
                slidePosition.x,
                slidePosition.y,
                slidePosition.z
            );

            if (!this.collisionManager.checkCollisions(this.player)) {
                return slidePosition;
            }
        }

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
