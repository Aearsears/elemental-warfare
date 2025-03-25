export class CollisionHandler {
    constructor(scene, height, width, tileSize) {
        this.scene = scene;
        this.height = height;
        this.width = width;
        this.tileSize = tileSize;
    }

    setupCollisions() {
        // Collision between player and walls
        //TODO: fix bottom layer not colliding
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
        console.log('Player collided with dungeon layer!');
        // You can add additional checks to verify collision properties
    }
    handlePlayerEnemyCollision(player, enemy) {
        console.log('Player hit by enemy!');
        // todo: need to fix knockback
        // Optional: Knockback effect (push the player away)
        let knockbackDistance = 200; // Increase for stronger knockback
        let angle = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            player.x,
            player.y
        ); // Angle from enemy to player
        console.log('knockabck:' + Math.cos(angle) * knockbackDistance);

        player.setVelocity(
            Math.cos(angle) * knockbackDistance,
            Math.sin(angle) * knockbackDistance
        );
        player.setDamping(true);
        player.setDrag(100); // Adjust the drag value to control slowdown speed

        enemy.setVelocity(0, 0);
        // Optionally reduce player health here
        // this.scene.reducePlayerHealth(enemy.damage);
    }
}
