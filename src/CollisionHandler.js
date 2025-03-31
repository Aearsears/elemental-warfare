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
            this.width + this.tileSize * 2,
            this.height + this.tileSize * 2
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
    // Define the collider callback function
    handlePlayerDungeonCollision(player, layer) {
        // console.log('Player collided with dungeon layer!');
        // You can add additional checks to verify collision properties
    }
    handlePlayerEnemyCollision(player, enemy) {
        // Apply knockback effect

        let angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            player.x,
            player.y
        ); // Angle from enemy to player
        let dir = {};
        dir.x = Math.cos(angle);
        dir.y = Math.sin(angle);

        // Optionally reduce player health here
        this.scene.reducePlayerHealth(enemy.damage, dir);
    }
}
