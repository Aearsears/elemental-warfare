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
        // Initialize map with walls (1 for wall, 0 for ground)
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
                    this.dungeon[j][k] = 0; // Marking ground tiles
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
            console.log('Tilemap created:', tilemap);

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

            // Debugging: Check if tilesets are loaded correctly
            if (!wallTileset || !groundTileset) {
                console.error('Tilesets are not loaded properly.');
                return;
            } else {
                console.log('Tilesets loaded:', wallTileset, groundTileset);
            }

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

            // Debugging: Check if layers were created
            if (!groundLayer || !wallLayer) {
                throw new Error('Tilemap layers not created properly.');
            } else {
                console.log('Tilemap layers created:', groundLayer, wallLayer);
            }

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

            // Position the tilemap in the scene (optional)
            tilemap.setPosition(0, 0);
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
