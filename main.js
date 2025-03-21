import { CollisionHandler } from './src/CollisionHandler.js';
import { Item } from './src/items/Item.js';
import { Player } from './src/entities/Player.js';
import { Enemy } from './src/entities/Enemy.js';
import { DungeonGenerator } from './src/dungeon/DungeonGenerator.js';
class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
        this.dungeon = [];
        this.mapWidth = 100;
        this.mapHeight = 100;
        this.enemies = [];
        this.items = [];
        this.collisionHandler = null; // Add this
        this.playerHealth = 100;
        this.isGameOver = false; // Prevents health from continuously dropping after game over
    }

    preload() {
        // Load textures (images or sprite sheets)
        this.load.spritesheet('player', 'assets/IDLE.png', {
            frameWidth: 96,
            frameHeight: 96
        });
        this.load.spritesheet('player_run', 'assets/RUN.png', {
            frameWidth: 96,
            frameHeight: 96
        });
        this.load.spritesheet('player_hurt', 'assets/HURT.png', {
            frameWidth: 96,
            frameHeight: 96
        });
        this.load.spritesheet('player_attack', 'assets/ATTACK.png', {
            frameWidth: 96,
            frameHeight: 96
        });
        // Add more textures if necessary, for example:
        // this.load.image('enemy', 'assets/enemy.png');
        // this.load.image('item', 'assets/item.png');
    }

    create() {
        this.isGameOver = false; // Reset game over state
        this.playerHealth = 100; // Reset player health
        this.enemies = []; // Reset enemies
        this.items = []; // Reset items

        // Create DungeonMap instance and generate the dungeon
        this.dungeonGenerator = new DungeonGenerator(
            this.mapWidth,
            this.mapHeight
        );
        this.dungeonGenerator.generateDungeon();
        this.dungeonGenerator.drawDungeon(this);

        this.createPlayer();
        this.createEnemies();
        this.createItems();
        this.createControls();

        this.collisionHandler = new CollisionHandler(this);
        this.collisionHandler.setupCollisions();
    }

    createPlayer() {
        this.player = new Player(this, 64, 64, 32); // Adjust starting position
    }

    createEnemies() {
        const enemyTypes = [
            { health: 50, damage: 10, speed: 50, color: 0xff0000 },
            { health: 80, damage: 15, speed: 40, color: 0x00ff00 }
        ];

        for (let i = 0; i < 3; i++) {
            let x = Phaser.Math.Between(50, 600);
            let y = Phaser.Math.Between(50, 350);
            let type =
                enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
            let enemy = new Enemy(this, x, y, 32, type);
            this.enemies.push(enemy);
        }
    }

    createItems() {
        const itemTypes = [
            {
                shape: 'circle',
                color: 0xffff00,
                effect: (player) => {
                    console.log('Collected health potion!');
                    player.health += 20; // Example effect
                }
            },
            {
                shape: 'square',
                color: 0xff0000,
                effect: (player) => {
                    console.log('Collected damage boost!');
                    player.damage += 5;
                }
            }
        ];

        for (let i = 0; i < 3; i++) {
            let x = Phaser.Math.Between(50, 600);
            let y = Phaser.Math.Between(50, 350);
            let type = Phaser.Utils.Array.GetRandom(itemTypes);

            let item = new Item(this, x, y, type, 32);
            this.items.push(item);
        }
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.isGameOver) return; // Stop updates if the game is over
        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }

        this.player.update(); // Ensure the health bar follows

        // Make enemies chase the player
        this.enemies.forEach((enemy) => {
            enemy.update();
            enemy.moveToward(this.player);
        });

        // Check for item pickup
        this.items = this.items.filter((item) => {
            if (
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    item.x,
                    item.y
                ) < 10
            ) {
                item.destroy();
                return false;
            }
            return true;
        });
    }

    reducePlayerHealth(amount) {
        if (this.isGameOver) return; // Prevent multiple restarts

        this.playerHealth -= amount;
        console.log(`Player Health: ${this.playerHealth}`);

        if (this.playerHealth <= 0) {
            console.log('Game Over!');
            this.isGameOver = true; // Prevent multiple game over triggers

            // Destroy all enemies and items
            this.enemies.forEach((enemy) => enemy.destroy());
            this.items.forEach((item) => item.destroy());

            // Reset other scene objects
            this.dungeon = [];

            // Delay the scene restart slightly to avoid conflicts
            this.time.delayedCall(500, () => {
                this.scene.restart();
            });
        }
    }
}
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 400,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: DungeonScene
};

const game = new Phaser.Game(config);
