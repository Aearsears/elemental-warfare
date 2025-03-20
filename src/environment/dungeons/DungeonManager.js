import * as THREE from 'three';

export class DungeonManager {
    constructor(scene) {
        this.scene = scene;
        this.activeDungeons = new Map();
        this.currentDungeon = null;
    }

    createDungeon(dungeonData) {
        const dungeon = {
            id: Math.random().toString(36).substr(2, 9),
            mesh: this.createDungeonMesh(dungeonData),
            rooms: this.createDungeonRooms(dungeonData.rooms),
            boss: dungeonData.boss,
            entrance: this.createDungeonEntrance(dungeonData.entrancePosition),
            isActive: false
        };

        this.activeDungeons.set(dungeon.id, dungeon);
        this.scene.add(dungeon.mesh);
        this.scene.add(dungeon.entrance);

        return dungeon;
    }

    createDungeonMesh(dungeonData) {
        const geometry = new THREE.BoxGeometry(10, 5, 10);
        const material = new THREE.MeshPhongMaterial({
            color: 0x555555,
            transparent: true,
            opacity: 0.8,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(dungeonData.position);
        return mesh;
    }

    createDungeonEntrance(position) {
        const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            emissive: 0x4a0000,
            emissiveIntensity: 0.5
        });
        const entrance = new THREE.Mesh(geometry, material);
        entrance.position.copy(position);
        entrance.position.y = 0.1;
        return entrance;
    }

    createDungeonRooms(roomsData) {
        const rooms = [];
        const roomSpacing = 15; // Space between rooms

        roomsData.forEach((roomData, index) => {
            const room = {
                id: `room_${index}`,
                mesh: this.createRoomMesh(roomData),
                monsters: this.createRoomMonsters(roomData.monsters),
                treasures: this.createRoomTreasures(roomData.treasures),
                isCleared: false,
                position: this.calculateRoomPosition(index, roomSpacing)
            };

            // Position the room mesh
            room.mesh.position.copy(room.position);

            // Add room lighting
            const light = new THREE.PointLight(0x994411, 1, 20);
            light.position.copy(room.position);
            light.position.y += 3;
            room.light = light;

            // Add room to scene
            this.scene.add(room.mesh);
            this.scene.add(room.light);
            rooms.push(room);
        });

        // Create corridors between rooms
        for (let i = 0; i < rooms.length - 1; i++) {
            const corridor = this.createCorridor(rooms[i], rooms[i + 1]);
            this.scene.add(corridor);
        }

        return rooms;
    }

    createRoomMesh(roomData) {
        const geometry = new THREE.BoxGeometry(roomData.size, 4, roomData.size);
        const material = new THREE.MeshPhongMaterial({
            color: 0x332211,
            shininess: 30,
            specular: 0x111111
        });
        return new THREE.Mesh(geometry, material);
    }

    createCorridor(roomA, roomB) {
        const start = roomA.position;
        const end = roomB.position;
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();

        const geometry = new THREE.BoxGeometry(2, 3, length);
        const material = new THREE.MeshPhongMaterial({
            color: 0x222222,
            shininess: 20,
            specular: 0x111111
        });

        const corridor = new THREE.Mesh(geometry, material);
        corridor.position.copy(start);
        corridor.position.add(direction.multiplyScalar(0.5));

        // Rotate corridor to point to next room
        corridor.lookAt(end);
        return corridor;
    }

    calculateRoomPosition(index, spacing) {
        // Create a spiral pattern for room placement
        const angle = index * Math.PI * 0.5;
        const radius = (index + 1) * spacing * 0.5;

        return new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
    }

    createRoomMonsters(monstersData) {
        return monstersData.map((monsterData) => ({
            ...monsterData,
            mesh: this.createMonsterMesh(monsterData),
            isAlive: true
        }));
    }

    createMonsterMesh(monsterData) {
        // Create different meshes based on monster type
        const geometry = new THREE.ConeGeometry(1, 2, 8);
        const material = new THREE.MeshPhongMaterial({
            color: monsterData.type === 'elite' ? 0xff0000 : 0x884400
        });
        return new THREE.Mesh(geometry, material);
    }

    createRoomTreasures(treasuresData) {
        return treasuresData.map((treasureData) => ({
            ...treasureData,
            mesh: this.createTreasureMesh(treasureData),
            isCollected: false
        }));
    }

    createTreasureMesh(treasureData) {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffdd00,
            emissive: 0x442200,
            emissiveIntensity: 0.2
        });
        return new THREE.Mesh(geometry, material);
    }

    enterDungeon(dungeonId, player) {
        const dungeon = this.activeDungeons.get(dungeonId);
        if (!dungeon) return;

        this.currentDungeon = dungeon;
        dungeon.isActive = true;
        // Save player's overworld position
        player.overworldPosition = player.getPosition().clone();
        // Move player to dungeon start position
        player.setPosition(dungeon.entrance.position);
    }

    exitDungeon(player) {
        if (!this.currentDungeon) return;

        this.currentDungeon.isActive = false;
        // Restore player's overworld position
        if (player.overworldPosition) {
            player.setPosition(player.overworldPosition);
            player.overworldPosition = null;
        }
        this.currentDungeon = null;
    }

    update(delta) {
        this.activeDungeons.forEach((dungeon) => {
            if (dungeon.isActive) {
                // Update dungeon state, monsters, etc.
                this.updateDungeonState(dungeon, delta);
            }
        });
    }
}
