export class DungeonGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
    }

    generate() {
        this.tiles = Array(this.height)
            .fill()
            .map(
                () => Array(this.width).fill(1) // 1 represents walls
            );

        // Create rooms
        const rooms = this.generateRooms(10);
        rooms.forEach((room) => this.carveRoom(room));

        // Connect rooms with corridors
        for (let i = 0; i < rooms.length - 1; i++) {
            this.connectRooms(rooms[i], rooms[i + 1]);
        }

        // Add doors and decorations
        this.addDoors(rooms);
        this.addDecorations();

        return {
            tiles: this.tiles,
            rooms: rooms,
            width: this.width,
            height: this.height
        };
    }

    generateRooms(count) {
        const rooms = [];
        for (let i = 0; i < count; i++) {
            const room = {
                x: Math.floor(Math.random() * (this.width - 10)) + 1,
                y: Math.floor(Math.random() * (this.height - 10)) + 1,
                width: Math.floor(Math.random() * 6) + 4,
                height: Math.floor(Math.random() * 6) + 4
            };
            if (!this.roomOverlaps(room, rooms)) {
                rooms.push(room);
            }
        }
        return rooms;
    }

    carveRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (
                    y > 0 &&
                    y < this.height - 1 &&
                    x > 0 &&
                    x < this.width - 1
                ) {
                    this.tiles[y][x] = 0; // 0 represents floor
                }
            }
        }
    }

    connectRooms(roomA, roomB) {
        const startX = roomA.x + Math.floor(roomA.width / 2);
        const startY = roomA.y + Math.floor(roomA.height / 2);
        const endX = roomB.x + Math.floor(roomB.width / 2);
        const endY = roomB.y + Math.floor(roomB.height / 2);

        // Create L-shaped corridor
        this.carveCorridor(startX, startY, endX, startY);
        this.carveCorridor(endX, startY, endX, endY);
    }

    carveCorridor(startX, startY, endX, endY) {
        const x1 = Math.min(startX, endX);
        const x2 = Math.max(startX, endX);
        const y1 = Math.min(startY, endY);
        const y2 = Math.max(startY, endY);

        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if (
                    y > 0 &&
                    y < this.height - 1 &&
                    x > 0 &&
                    x < this.width - 1
                ) {
                    this.tiles[y][x] = 0;
                }
            }
        }
    }

    roomOverlaps(room, otherRooms) {
        return otherRooms.some(
            (other) =>
                room.x < other.x + other.width + 1 &&
                room.x + room.width + 1 > other.x &&
                room.y < other.y + other.height + 1 &&
                room.y + room.height + 1 > other.y
        );
    }
}
