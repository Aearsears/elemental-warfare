import { CollisionHandler } from './src/CollisionHandler.js';
import { Item } from './src/items/Item.js';
import { Player } from './src/entities/Player.js';
import { Enemy } from './src/entities/Enemy.js';
import { DungeonGenerator } from './src/dungeon/DungeonGenerator.js';
import {
    HealAbility,
    BombAbility,
    ShieldAbility
} from './src/abilities/Ability.js';
class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
        this.dungeon = [];
        this.mapWidth = 640;
        this.mapHeight = 480;
        this.tileSize = 16;
        this.enemies = [];
        this.items = [];
        this.collisionHandler = null; // Add this
        this.isGameOver = false; // Prevents health from continuously dropping after game over
        this.isCountdownActive = false; // New flag to control countdown
    }

    preload() {
        // Load textures (images or sprite sheets)
        const directions = [
            'Up',
            'Down',
            'Left_Down',
            'Left_Up',
            'Right_Down',
            'Right_Up'
        ];
        directions.forEach((dir) => {
            this.load.spritesheet(
                `player_idle_${dir}`,
                `assets/player/Idle/idle_${dir}.png`,
                {
                    frameWidth: 48,
                    frameHeight: 64
                }
            );
            this.load.spritesheet(
                `player_walk_${dir}`,
                `assets/player/Walk/walk_${dir}.png`,
                {
                    frameWidth: 48,
                    frameHeight: 64
                }
            );
            this.load.spritesheet(
                `player_dash_${dir}`,
                `assets/player/Dash/Dash_${dir}.png`,
                {
                    frameWidth: 48,
                    frameHeight: 64
                }
            );
            this.load.spritesheet(
                `player_dash_dust_${dir}`,
                `assets/player/Dash/Dust/Dash_Dust_${dir}.png`,
                {
                    frameWidth: 48,
                    frameHeight: 64
                }
            );
        });

        this.load.spritesheet('orc', 'assets/orc/idle.png', {
            frameWidth: 100,
            frameHeight: 100
        });
        this.load.spritesheet('orc_attack1', 'assets/orc/attack1.png', {
            frameWidth: 100,
            frameHeight: 100
        });
        this.load.spritesheet('orc_attack2', 'assets/orc/attack2.png', {
            frameWidth: 100,
            frameHeight: 100
        });
        this.load.spritesheet('orc_walk', 'assets/orc/walk.png', {
            frameWidth: 100,
            frameHeight: 100
        });
        this.load.spritesheet('orc_hurt', 'assets/orc/hurt.png', {
            frameWidth: 100,
            frameHeight: 100
        });
        this.load.spritesheet('orc_death', 'assets/orc/death.png', {
            frameWidth: 100,
            frameHeight: 100
        });

        this.load.spritesheet('bomb', 'assets/abilities/bomb_effect.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.spritesheet('heal', 'assets/abilities/heal_effect.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.spritesheet('shield', 'assets/abilities/shield_effect.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.spritesheet('bullet', 'assets/abilities/bullet.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.image('background_tileset', 'assets/env/background.png'); // Replace with your tileset path
        this.load.image('wall_tileset', 'assets/env/walls.png'); // Replace with your tileset path
    }

    create() {
        this.isGameOver = false; // Reset game over state
        this.enemies = []; // Reset enemies
        this.items = []; // Reset items

        this.createPlayer();
        this.createEnemies();
        this.createItems();
        this.createControls();
        this.createAbilites();

        // Create DungeonMap instance and generate the dungeon
        this.dungeonGenerator = new DungeonGenerator(
            this,
            this.mapWidth,
            this.mapHeight,
            'wall_tileset',
            'background_tileset',
            this.tileSize
        );
        this.dungeonGenerator.generateDungeon();
        this.dungeonGenerator.drawDungeon(this);

        this.collisionHandler = new CollisionHandler(
            this,
            this.mapHeight,
            this.mapWidth,
            this.tileSize
        );
        this.collisionHandler.setupCollisions();

        //create bullet animation
        this.anims.create({
            key: 'bulletMove',
            frames: this.anims.generateFrameNumbers('bullet', {
                start: 0,
                end: 3
            }), // Adjust based on your sprite sheet
            frameRate: 10, // How fast the frames cycle
            repeat: -1 // Set to loop indefinitely
        });

        // Set camera to follow the player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setFollowOffset(0, 0); // Optional: to keep the player centered in the camera view
        this.cameras.main.setDeadzone(0.2); // Optional: to set a deadzone (how much the player can move before the camera starts following)

        // Optional: Set camera bounds if you want the camera not to move outside the dungeon
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        // Create countdown text (Initially hidden)
        this.countdownText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            '3',
            {
                font: '48px Arial',
                fill: '#ffffff',
                align: 'center'
            }
        );
        this.countdownText.setOrigin(0.5, 0.5); // Center the text
        this.countdownText.setDepth(1000);

        // Start the countdown before the level begins
        this.startCountdown();
        //debug

        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = true;
    }
    startCountdown() {
        let countdown = 3; // Start from 3

        // Use a timer event to update countdown every second
        this.time.addEvent({
            delay: 1000, // 1 second delay
            callback: () => {
                countdown--; // Decrease the countdown number
                this.countdownText.setText(countdown.toString()); // Update the text

                // Once countdown reaches 0, start the level
                if (countdown <= 0) {
                    this.countdownText.setVisible(false); // Hide countdown text
                    this.isCountdownActive = false; // Set countdown as complete
                    this.startLevel(); // Start the actual level
                }
            },
            repeat: 2 // Repeat the timer 2 more times (to cover 3, 2, 1)
        });

        this.isCountdownActive = true; // Set countdown as active
    }
    startLevel() {
        this.player.setVelocity(0, 0);
        this.enemies.forEach((enemy) => {
            enemy.setVelocity(0, 0);
        });
    }
    createPlayer() {
        this.player = new Player(this, 64, 64, 32); // Adjust starting position
        if (gameState.abilityPool) {
            this.player.abilityPool.push(...gameState.abilityPool);
        }
        if (gameState.selectedAbility) {
            this.player.abilityPool.push(gameState.selectedAbility);
        }
    }

    createAbilites() {
        this.healAbility = new HealAbility(this.player);
        this.bombAbility = new BombAbility(this.player);
        this.shieldAbility = new ShieldAbility(this.player);
        this.player.abilityPool = [
            this.bombAbility,
            this.bombAbility,
            this.bombAbility,
            this.bombAbility,
            this.bombAbility,
            this.healAbility,
            this.shieldAbility
        ];
    }

    createEnemies() {
        const enemyTypes = [
            { health: 100, damage: 10, speed: 50, color: 0xff0000 },
            { health: 80, damage: 15, speed: 40, color: 0x00ff00 }
        ];
        const enemyCount = this.level * 2;
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
        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown) moveX = -1;
        if (this.cursors.right.isDown) moveX = 1;
        if (this.cursors.up.isDown) moveY = -1;
        if (this.cursors.down.isDown) moveY = 1;

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= Math.SQRT1_2;
            moveY *= Math.SQRT1_2;
        }
        this.player.setVelocity(moveX * 200, moveY * 200);

        this.player.update(); // Ensure the health bar follows

        // Make enemies chase the player
        this.enemies.forEach((enemy) => {
            enemy.update();
            // enemy.moveToward(this.player);
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

        const allEnemiesDestroyed = this.enemies.every(
            (enemy) => !enemy.active
        );

        if (allEnemiesDestroyed) {
            this.level++; // Increase the level after completing the current one
            this.levelComplete(); // Restart the level with new difficulty
        }
    }
    levelComplete() {
        // Transition to ability selection scene
        // this.scene.start('AbilitySelectionScene');
        this.restart();
    }
    restart() {
        if (this.isGameOver) return; // Prevent multiple restarts
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
    reducePlayerHealth(amount) {
        if (this.isGameOver) return; // Prevent multiple restarts

        this.player.health -= amount;
        console.log(`Player Health: ${this.player.health}`);

        if (this.player.health <= 0) {
            this.restart();
        }
    }
}
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        parent: 'game-container',
        mode: Phaser.Scale.RESIZE, // Automatically resizes to fit the window
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: DungeonScene
};
const gameState = {
    selectedAbility: null,
    abilityPool: []
};
const game = new Phaser.Game(config);
