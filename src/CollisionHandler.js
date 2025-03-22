export class CollisionHandler {
    constructor(scene, height, width, tileSize) {
        this.scene = scene;
        this.height = height;
        this.width = width;
        this.tileSize = tileSize;
    }

    setupCollisions() {
        // Collision between player and walls
        this.scene.physics.world.setBounds(
            0,
            0,
            this.width - this.tileSize,
            this.height - this.tileSize
        );
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
        // this.scene.reducePlayerHealth(enemy.damage);

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
