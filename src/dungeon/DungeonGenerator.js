export class DungeonGenerator {
    constructor(
        mapWidth,
        mapHeight,
        wallTilesetKey,
        groundTilesetKey,
        tileSize
    ) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.wallTilesetKey = wallTilesetKey; // The key for your wall tileset image
        this.groundTilesetKey = groundTilesetKey; // The key for your ground tileset image
        this.tileSize = tileSize;
        this.dungeon = [];
    }

    generateDungeon() {
        // Initialize the map with ground (0)
        this.dungeon = Array.from({ length: this.mapHeight }, () =>
            Array(this.mapWidth).fill(0)
        );

        // Set up walls along the top and bottom
        for (let x = 0; x < this.mapWidth; x++) {
            this.dungeon[0][x] = 1; // Top wall
            this.dungeon[this.mapHeight - 1][x] = 1; // Bottom wall
        }

        // Set up walls along the left and right
        for (let y = 0; y < this.mapHeight; y++) {
            this.dungeon[y][0] = 1; // Left wall
            this.dungeon[y][this.mapWidth - 1] = 1; // Right wall
        }
        // this.dungeon[this.mapWidth - 1][this.mapHeight - 1] = 1; // Top wall
        let rooms = 5;
        for (let i = 0; i < rooms; i++) {
            let w = Phaser.Math.Between(3, 8);
            let h = Phaser.Math.Between(3, 8);
            let x = Phaser.Math.Between(1, this.mapWidth - w - 2);
            let y = Phaser.Math.Between(1, this.mapHeight - h - 2);

            for (let j = y; j < y + h; j++) {
                for (let k = x; k < x + w; k++) {
                    this.dungeon[j][k] = 0; // Mark ground inside rooms
                }
            }
        }
    }

    drawDungeon(scene) {
        try {
            // Create tilemap
            const tilemap = scene.make.tilemap({
                tileWidth: this.tileSize,
                tileHeight: this.tileSize,
                width: this.mapWidth,
                height: this.mapHeight
            });

            // Load tilesets
            const wallTileset = tilemap.addTilesetImage(
                this.wallTilesetKey,
                null,
                this.tileSize,
                this.tileSize
            );
            const groundTileset = tilemap.addTilesetImage(
                this.groundTilesetKey,
                null,
                this.tileSize,
                this.tileSize
            );

            // Create ground layer (for tiles of type 0 - ground)
            const groundLayer = tilemap.createBlankLayer(
                'ground_layer',
                groundTileset,
                0,
                0
            ); // Ground layer created with ID 0
            // Create wall layer (for tiles of type 1 - walls)
            const wallLayer = tilemap.createBlankLayer(
                'wall_layer',
                wallTileset,
                0,
                0
            ); // Wall layer created with ID 1

            // Now, we can iterate over the dungeon data and place the tiles
            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    if (this.dungeon[y][x] === 1) {
                        // If it's a wall, place a wall tile (index 1 in the wallTileset)
                        wallLayer.putTileAt(1, x, y); // Place wall tile at index 1
                    } else if (this.dungeon[y][x] === 0) {
                        // If it's ground, place a ground tile (index 0 in the groundTileset)
                        groundLayer.putTileAt(0, x, y); // Place ground tile at index 0
                    }
                }
            }
        } catch (error) {
            // Log the error with more detailed information
            console.error(
                'An error occurred while creating the dungeon:',
                error
            );
            console.error('Map Width:', this.mapWidth);
            console.error('Map Height:', this.mapHeight);
            console.error('Tileset Key for Walls:', this.wallTilesetKey);
            console.error('Tileset Key for Ground:', this.groundTilesetKey);
        }
    }
}
