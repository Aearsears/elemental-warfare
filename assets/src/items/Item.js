export class Item extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type, tileSize) {
        super(scene, x, y);
        this.scene = scene;
        this.type = type;

        // Create the item's shape
        this.shape = scene.add.graphics();
        this.shape.fillStyle(type.color, 1);

        switch (type.shape) {
            case 'circle':
                this.shape.fillCircle(0, 0, tileSize / 4);
                break;
            case 'square':
                this.shape.fillRect(
                    -tileSize / 4,
                    -tileSize / 4,
                    tileSize / 2,
                    tileSize / 2
                );
                break;
            default:
                this.shape.fillTriangle(
                    0,
                    -tileSize / 4,
                    tileSize / 4,
                    tileSize / 4,
                    -tileSize / 4,
                    tileSize / 4
                );
        }

        this.add(this.shape);

        // Add glow effect (slightly transparent circle behind)
        this.glow = scene.add.graphics();
        this.glow.fillStyle(type.color, 0.3);
        this.glow.fillCircle(0, 0, tileSize / 3);
        this.add(this.glow);

        // Enable physics for collision detection
        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setSize(tileSize / 2, tileSize / 2);
        this.body.setCollideWorldBounds(true);
    }

    collect(player) {
        this.type.effect(player);
        this.destroy(); // Remove item after collecting
    }
}
