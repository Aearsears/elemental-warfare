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
        this.wallTilesetKey = wallTilesetKey;
        this.groundTilesetKey = groundTilesetKey;
        this.tileSize = tileSize;
        this.dungeon = [];
    }

    generateDungeon() {
        // Initialize the map with ground (0)
        this.dungeon = Array.from(
            { length: this.mapHeight / this.tileSize },
            () => Array(this.mapWidth / this.tileSize).fill(0)
        );

        // Calculate how many tiles are in the map width and height
        const tilesWide = this.mapWidth / this.tileSize; // 40 tiles
        const tilesTall = this.mapHeight / this.tileSize; // 30 tiles

        // Set up walls along the top and bottom
        for (let x = 0; x < tilesWide; x++) {
            this.dungeon[0][x] = 1; // Top wall
            this.dungeon[tilesTall - 1][x] = 1; // Bottom wall
        }

        // Set up walls along the left and right
        for (let y = 0; y < tilesTall; y++) {
            this.dungeon[y][0] = 1; // Left wall
            this.dungeon[y][tilesWide - 1] = 1; // Right wall
        }
    }

    drawDungeon(scene) {
        try {
            // Create tilemap
            const tilemap = scene.make.tilemap({
                tileWidth: this.tileSize,
                tileHeight: this.tileSize,
                width: this.mapWidth / this.tileSize, // Number of tiles wide
                height: this.mapHeight / this.tileSize // Number of tiles tall
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

            groundLayer.setDepth(0); // Background layer
            wallLayer.setDepth(1); // Ensure walls are above ground

            // Now, we can iterate over the dungeon data and place the tiles
            for (let y = 0; y < this.mapHeight / this.tileSize; y++) {
                for (let x = 0; x < this.mapWidth / this.tileSize; x++) {
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
