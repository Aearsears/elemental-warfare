export class DungeonGenerator {
    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.dungeon = [];
    }

    generateDungeon() {
        // Initialize map with walls
        this.dungeon = Array.from({ length: this.mapHeight }, () =>
            Array(this.mapWidth).fill(1)
        );

        let rooms = 5;
        for (let i = 0; i < rooms; i++) {
            let w = Phaser.Math.Between(5, 10);
            let h = Phaser.Math.Between(5, 10);
            let x = Phaser.Math.Between(1, this.mapWidth - w - 1);
            let y = Phaser.Math.Between(1, this.mapHeight - h - 1);

            for (let j = y; j < y + h; j++) {
                for (let k = x; k < x + w; k++) {
                    this.dungeon[j][k] = 0;
                }
            }
        }
    }

    drawDungeon(scene, tileSize = 16) {
        scene.add.graphics().clear();
        let graphics = scene.add.graphics({ fillStyle: { color: 0x555555 } });

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.dungeon[y][x] === 1) {
                    graphics.fillRect(
                        x * tileSize,
                        y * tileSize,
                        tileSize,
                        tileSize
                    );
                }
            }
        }
    }
}
