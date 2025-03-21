export class CollisionHandler {
    constructor(scene) {
        this.scene = scene;
    }

    setupCollisions() {
        // Collision between player and walls
        this.scene.physics.world.setBounds(0, 0, 640, 400);
        this.scene.physics.add.collider(
            this.scene.player,
            this.scene.dungeonLayer
        );

        // Collision between player and enemies
        this.scene.enemies.forEach((enemy) => {
            this.scene.physics.add.collider(
                this.scene.player,
                enemy,
                this.handlePlayerEnemyCollision,
                null,
                this
            );
        });
    }

    handlePlayerEnemyCollision(player, enemy) {
        console.log('Player hit by enemy!');
        this.scene.reducePlayerHealth(enemy.damage);

        // Optional: Knockback effect (push the player away)
        let knockbackDistance = 10;
        let angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            player.x,
            player.y
        );
        player.setVelocity(
            Math.cos(angle) * knockbackDistance,
            Math.sin(angle) * knockbackDistance
        );
    }
}
