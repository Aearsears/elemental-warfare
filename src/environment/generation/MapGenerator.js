import * as THREE from 'three';
import { PerlinNoise } from './PerlinNoise.js';

export class MapGenerator {
    constructor(config = {}) {
        this.config = {
            radius: 50,
            roughness: 0.8,
            minHeight: -2,
            maxHeight: 2,
            dungeonCount: 3,
            ...config
        };
        this.noise = new PerlinNoise();
        this.biomes = {
            FOREST: {
                color: 0x228b22,
                trees: { density: 0.8, maxHeight: 3 },
                monsters: ['wolf', 'bear', 'ent']
            },
            DESERT: {
                color: 0xd2b48c,
                trees: { density: 0.2, maxHeight: 2 },
                monsters: ['scorpion', 'snake', 'sandworm']
            },
            MOUNTAIN: {
                color: 0x808080,
                trees: { density: 0.4, maxHeight: 2.5 },
                monsters: ['golem', 'dragon', 'griffin']
            },
            SWAMP: {
                color: 0x4a5d23,
                trees: { density: 0.6, maxHeight: 2.8 },
                monsters: ['troll', 'hydra', 'witch']
            }
        };
    }

    generateMap() {
        const biomeMap = this.generateBiomeMap();
        const dungeons = this.generateDungeons();

        return {
            terrain: this.generateTerrain(biomeMap),
            biomeMap,
            dungeons,
            obstacles: this.generateObstacles(biomeMap),
            monsters: this.generateMonsters(biomeMap, dungeons),
            items: this.generateItems(),
            spawnPoint: this.findPlayerSpawnPoint(dungeons)
        };
    }

    generateBiomeMap() {
        const biomeNoise = new PerlinNoise(Math.random());
        const temperatureNoise = new PerlinNoise(Math.random());
        const moistureNoise = new PerlinNoise(Math.random());

        return (x, z) => {
            const temperature = temperatureNoise.get(x * 0.02, z * 0.02);
            const moisture = moistureNoise.get(x * 0.02, z * 0.02);

            if (temperature > 0.6) return this.biomes.DESERT;
            if (moisture > 0.6) return this.biomes.SWAMP;
            if (temperature < -0.2) return this.biomes.MOUNTAIN;
            return this.biomes.FOREST;
        };
    }

    generateDungeons() {
        const dungeons = [];
        for (let i = 0; i < this.config.dungeonCount; i++) {
            dungeons.push(this.generateDungeon());
        }
        return dungeons;
    }

    generateDungeon() {
        const angle = Math.random() * Math.PI * 2;
        const distance =
            this.config.radius * 0.4 + Math.random() * this.config.radius * 0.3;
        const position = new THREE.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );

        return {
            position,
            type: this.getRandomDungeonType(),
            rooms: this.generateDungeonRooms(),
            boss: this.generateDungeonBoss(),
            entrancePosition: position.clone()
        };
    }

    generateDungeonRooms() {
        const rooms = [];
        const roomCount = 3 + Math.floor(Math.random() * 5);

        for (let i = 0; i < roomCount; i++) {
            rooms.push({
                size: 5 + Math.random() * 5,
                monsters: this.generateDungeonRoomMonsters(),
                treasures: this.generateDungeonTreasures()
            });
        }

        return rooms;
    }

    generateDungeonRoomMonsters() {
        return Array(Math.floor(Math.random() * 4) + 2)
            .fill(null)
            .map(() => ({
                type: this.getRandomMonsterType(),
                level: this.getMonsterLevel('dungeon'),
                drops: this.generateMonsterDrops('dungeon')
            }));
    }

    generateDungeonTreasures() {
        const treasureCount = Math.floor(Math.random() * 3) + 1; // 1-3 treasures per room
        const treasures = [];

        for (let i = 0; i < treasureCount; i++) {
            treasures.push({
                type: this.getRandomTreasureType(),
                rarity: this.getTreasureRarity(),
                value: this.calculateTreasureValue(),
                contents: this.generateTreasureContents()
            });
        }

        return treasures;
    }

    getRandomTreasureType() {
        const types = [
            'wooden_chest',
            'silver_chest',
            'golden_chest',
            'ancient_chest',
            'crystal_container',
            'magical_vault'
        ];
        const rarityWeights = [0.4, 0.3, 0.15, 0.1, 0.03, 0.02];

        const roll = Math.random();
        let cumulative = 0;

        for (let i = 0; i < types.length; i++) {
            cumulative += rarityWeights[i];
            if (roll < cumulative) return types[i];
        }

        return types[0]; // Fallback to wooden chest
    }

    getTreasureRarity() {
        const roll = Math.random();
        if (roll < 0.02) return 'mythic';
        if (roll < 0.1) return 'legendary';
        if (roll < 0.25) return 'rare';
        if (roll < 0.5) return 'uncommon';
        return 'common';
    }

    calculateTreasureValue() {
        return Math.floor(Math.random() * 100) + 50;
    }

    generateTreasureContents() {
        const contents = [];
        const itemCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < itemCount; i++) {
            contents.push({
                type: this.getRandomDrop('dungeon'),
                rarity: this.getDropRarity('dungeon'),
                quantity: Math.floor(Math.random() * 3) + 1
            });
        }

        // Add gold
        contents.push({
            type: 'gold',
            quantity: Math.floor(Math.random() * 100) + 50
        });

        return contents;
    }

    generateDungeonBoss() {
        return {
            type: this.getRandomBossType(),
            level: this.getMonsterLevel('boss'),
            drops: this.generateMonsterDrops('boss')
        };
    }

    getRandomDungeonType() {
        const types = [
            'ancient_ruins',
            'dark_cave',
            'forgotten_temple',
            'haunted_crypt'
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomBossType() {
        const types = [
            'dragon_lord',
            'ancient_guardian',
            'chaos_wizard',
            'demon_king'
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    generateTerrain(biomeMap) {
        const geometry = new THREE.CircleGeometry(this.config.radius, 64);
        const positions = geometry.attributes.position.array;

        // Apply noise to vertex heights
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            const height =
                this.noise.get(x * 0.02, z * 0.02) * this.config.roughness;
            positions[i + 1] = Math.max(
                this.config.minHeight,
                Math.min(this.config.maxHeight, height)
            );
        }

        geometry.computeVertexNormals();
        return geometry;
    }

    generateObstacles(biomeMap) {
        const obstacles = [];
        const treePositions = this.generateRandomPositions(
            this.config.treeCount
        );

        treePositions.forEach((pos) => {
            obstacles.push({
                type: 'tree',
                position: pos,
                scale: 0.8 + Math.random() * 0.4
            });
        });

        return obstacles;
    }

    generateMonsters(biomeMap, dungeons) {
        const monsters = [];
        const monsterPositions = this.generateRandomPositions(
            this.config.monsterCount
        );

        monsterPositions.forEach((pos) => {
            const type = this.getRandomMonsterType();
            monsters.push({
                type,
                position: pos,
                level: this.getMonsterLevel(type),
                drops: this.generateMonsterDrops(type)
            });
        });

        return monsters;
    }

    generateItems() {
        const items = [];
        const itemCount = Math.floor(Math.random() * 10) + 5;
        const itemPositions = this.generateRandomPositions(itemCount);

        itemPositions.forEach((pos) => {
            items.push({
                type: this.getRandomItemType(),
                position: pos,
                rarity: this.getDropRarity()
            });
        });

        return items;
    }

    generateRandomPositions(count) {
        const positions = [];
        const minDistance = 5; // Minimum distance between objects

        for (let i = 0; i < count; i++) {
            let position;
            let attempts = 0;
            const maxAttempts = 50;

            do {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * (this.config.radius - 10);
                position = new THREE.Vector3(
                    Math.cos(angle) * distance,
                    0,
                    Math.sin(angle) * distance
                );
                attempts++;
            } while (
                this.isTooClose(position, positions, minDistance) &&
                attempts < maxAttempts
            );

            if (attempts < maxAttempts) {
                positions.push(position);
            }
        }

        return positions;
    }

    isTooClose(position, existingPositions, minDistance) {
        return existingPositions.some(
            (pos) => position.distanceTo(pos) < minDistance
        );
    }

    getRandomMonsterType() {
        const rand = Math.random();
        if (rand < 0.1) return 'boss';
        if (rand < 0.3) return 'elite';
        return 'normal';
    }

    getMonsterLevel(type) {
        switch (type) {
            case 'boss':
                return Math.floor(Math.random() * 5) + 10;
            case 'elite':
                return Math.floor(Math.random() * 3) + 5;
            default:
                return Math.floor(Math.random() * 3) + 1;
        }
    }

    findPlayerSpawnPoint(dungeons) {
        // Find a safe spot away from monsters
        const angle = Math.random() * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 5, 0, Math.sin(angle) * 5);
    }

    generateMonsterDrops(monsterType) {
        const drops = [];
        const dropCount = this.getDropCount(monsterType);

        for (let i = 0; i < dropCount; i++) {
            const dropType = this.getRandomDrop(monsterType);
            const rarity = this.getDropRarity(monsterType);

            drops.push({
                type: dropType,
                rarity,
                stats: this.generateDropStats(dropType, rarity)
            });
        }

        // Add guaranteed drops for special monsters
        if (monsterType === 'boss') {
            drops.push({
                type: 'legendary_item',
                rarity: 'legendary',
                stats: this.generateDropStats('legendary_item', 'legendary')
            });
        } else if (monsterType === 'elite') {
            drops.push({
                type: 'rare_item',
                rarity: 'rare',
                stats: this.generateDropStats('rare_item', 'rare')
            });
        }

        return drops;
    }

    getDropCount(monsterType) {
        switch (monsterType) {
            case 'boss':
                return Math.floor(Math.random() * 3) + 3; // 3-5 drops
            case 'elite':
                return Math.floor(Math.random() * 2) + 2; // 2-3 drops
            case 'dungeon':
                return Math.floor(Math.random() * 2) + 1; // 1-2 drops
            default:
                return Math.random() < 0.5 ? 1 : 0; // 50% chance of 1 drop
        }
    }

    getRandomDrop(monsterType) {
        const drops = {
            common: ['health_potion', 'mana_potion', 'gold_coin'],
            uncommon: ['weapon_scroll', 'armor_piece', 'magic_essence'],
            rare: ['elemental_core', 'ancient_relic', 'mystic_gem'],
            legendary: ['dragon_scale', 'phoenix_feather', 'void_crystal']
        };

        const rand = Math.random();
        if (monsterType === 'boss' && rand < 0.4) {
            return drops.legendary[
                Math.floor(Math.random() * drops.legendary.length)
            ];
        } else if (
            (monsterType === 'boss' || monsterType === 'elite') &&
            rand < 0.6
        ) {
            return drops.rare[Math.floor(Math.random() * drops.rare.length)];
        } else if (rand < 0.3) {
            return drops.uncommon[
                Math.floor(Math.random() * drops.uncommon.length)
            ];
        } else {
            return drops.common[
                Math.floor(Math.random() * drops.common.length)
            ];
        }
    }

    getDropRarity(monsterType) {
        const rand = Math.random();

        switch (monsterType) {
            case 'boss':
                if (rand < 0.4) return 'legendary';
                if (rand < 0.7) return 'rare';
                return 'uncommon';
            case 'elite':
                if (rand < 0.2) return 'rare';
                if (rand < 0.5) return 'uncommon';
                return 'common';
            case 'dungeon':
                if (rand < 0.1) return 'rare';
                if (rand < 0.3) return 'uncommon';
                return 'common';
            default:
                if (rand < 0.05) return 'rare';
                if (rand < 0.15) return 'uncommon';
                return 'common';
        }
    }

    generateDropStats(dropType, rarity) {
        const baseStats = {
            health_potion: { healing: 50 },
            mana_potion: { mana: 50 },
            weapon_scroll: { damage: 10 },
            armor_piece: { defense: 5 },
            elemental_core: { elementalPower: 15 },
            dragon_scale: { defense: 20, fireResistance: 30 }
            // ...add more item base stats as needed
        };

        const rarityMultiplier = {
            common: 1,
            uncommon: 1.5,
            rare: 2.5,
            legendary: 4
        };

        const stats = baseStats[dropType] || { value: 10 };

        // Apply rarity multiplier to all stats
        return Object.entries(stats).reduce((acc, [key, value]) => {
            acc[key] = Math.floor(value * rarityMultiplier[rarity]);
            return acc;
        }, {});
    }

    getRandomItemType() {
        const items = {
            weapons: ['sword', 'staff', 'bow', 'dagger', 'wand'],
            armor: ['helmet', 'chestplate', 'boots', 'gloves', 'shield'],
            consumables: ['health_potion', 'mana_potion', 'scroll', 'elixir'],
            materials: [
                'iron_ore',
                'magic_crystal',
                'ancient_fragment',
                'mystic_dust'
            ]
        };

        const category = Math.random();
        if (category < 0.3) {
            return items.consumables[
                Math.floor(Math.random() * items.consumables.length)
            ];
        } else if (category < 0.5) {
            return items.weapons[
                Math.floor(Math.random() * items.weapons.length)
            ];
        } else if (category < 0.7) {
            return items.armor[Math.floor(Math.random() * items.armor.length)];
        } else {
            return items.materials[
                Math.floor(Math.random() * items.materials.length)
            ];
        }
    }
}
