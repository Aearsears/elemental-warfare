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
const isDebugMode =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'; // Only enable debug on localhost
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
        this.level = 1;
        this.isSpawningEnemies = false;
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
        const enemies = [
            { name: 'orc', frameWidth: 100, frameHeight: 100 },
            { name: 'bat', frameWidth: 64, frameHeight: 64 },
            { name: 'mushroom', frameWidth: 80, frameHeight: 64 }
        ];
        const animations = ['idle', 'attack', 'move', 'hurt', 'die'];
        enemies.forEach((enemy) => {
            animations.forEach((animation) => {
                this.load.spritesheet(
                    `${enemy.name}_${animation}`,
                    `assets/${enemy.name}/${animation}.png`,
                    {
                        frameWidth: enemy.frameWidth,
                        frameHeight: enemy.frameHeight
                    }
                );
            });
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

        //music and sfx
        this.load.audio('bgm', 'assets/music/bgm.wav'); // Replace with your actual file path
        this.load.audio('bomb_sound', 'assets/sfx/bomb.wav');
        this.load.audio('bullet_sound', 'assets/sfx/bullet.wav');
        this.load.audio('dash_sound', 'assets/sfx/dash.wav');
        this.load.audio('heal_sound', 'assets/sfx/heal.wav');
        this.load.audio('walk_sound', 'assets/sfx/walk.wav');
        this.load.audio('shield_sound', 'assets/sfx/shield.wav');
        this.load.audio('hit_sound', 'assets/sfx/hit.wav');
        //ui
        this.load.image('card', 'assets/ui/card.png');
    }

    create() {
        this.isSpawningEnemies = false;
        this.isGameOver = false; // Reset game over state
        this.enemies = []; // Reset enemies
        this.items = []; // Reset items

        this.createPlayer();
        this.ui = this.player.abilityUI;
        this.createEnemies();
        // this.createItems();
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
        if (!this.anims.get('bulletMove')) {
            this.anims.create({
                key: 'bulletMove',
                frames: this.anims.generateFrameNumbers('bullet', {
                    start: 0,
                    end: 3
                }), // Adjust based on your sprite sheet
                frameRate: 10, // How fast the frames cycle
                repeat: -1 // Set to loop indefinitely
            });
        }

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
        // Create a semi-transparent black background behind the countdown text
        this.countdownTextBackground = this.add.graphics();
        const padding = 20;
        const textWidth = this.countdownText.width + padding;
        const textHeight = this.countdownText.height + padding;
        const x = this.cameras.main.centerX - textWidth / 2;
        const y = this.cameras.main.centerY - textHeight / 2;

        this.countdownTextBackground.fillStyle(0x000000, 0.5); // Black color with 50% opacity
        this.countdownTextBackground.fillRoundedRect(
            x,
            y,
            textWidth,
            textHeight,
            10
        ); // Rounded rectangle

        // Ensure the text appears on top of the background
        this.countdownTextBackground.setDepth(999);
        this.countdownText.setDepth(1000);

        // Start the countdown before the level begins
        this.startCountdown();
        //debug
        if (isDebugMode) {
            this.physics.world.createDebugGraphic();
            this.physics.world.drawDebug = true;
        }

        this.backgroundMusic = this.sound.add('bgm', {
            loop: true, // Make sure the music loops
            volume: 0.5 // Adjust volume if needed (0.0 to 1.0)
        });
        this.backgroundMusic.play();
    }
    startCountdown() {
        this.player.isFrozen = true;
        this.enemies.forEach((enemy) => {
            enemy.isFrozen = true;
        });
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
                    this.countdownTextBackground.setVisible(false);
                    this.isCountdownActive = false; // Set countdown as complete
                    this.startLevel(); // Start the actual level
                }
            },
            repeat: 2 // Repeat the timer 2 more times (to cover 3, 2, 1)
        });

        this.isCountdownActive = true; // Set countdown as active
    }
    startLevel() {
        this.player.isFrozen = false;
        this.enemies.forEach((enemy) => {
            enemy.isFrozen = false;
        });
    }
    createPlayer() {
        this.player = new Player(this, 640 / 2, 480 / 2, 32);
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
        Phaser.Utils.Array.Shuffle(this.player.abilityPool);
    }

    createEnemies() {
        const enemyCount = Math.min(this.level * 2, 20); // Cap max enemies at 20 for balance
        const baseStats = {
            health: 50 + this.level * 10,
            damage: 5 + this.level * 2,
            speed: 40 + this.level * 1.5
        };

        const enemyTypes = [
            {
                name: 'orc',
                health: baseStats.health,
                damage: baseStats.damage,
                speed: baseStats.speed,
                width: 24,
                height: 32,
                idle: 5,
                move: 7,
                hurt: 3,
                die: 3
            },
            {
                name: 'mushroom',
                health: baseStats.health * 2,
                damage: baseStats.damage * 0.8,
                speed: baseStats.speed * 0.7,
                width: 24,
                height: 32,
                idle: 6,
                move: 7,
                hurt: 4,
                die: 14
            },
            {
                name: 'bat',
                health: baseStats.health * 0.75,
                damage: baseStats.damage * 1.2,
                speed: baseStats.speed * 1.5,
                width: 24,
                height: 32,
                idle: 8,
                move: 7,
                hurt: 4,
                die: 11
            }
        ];

        for (let i = 0; i < enemyCount; i++) {
            let spawnDistance = Phaser.Math.Between(80, 150); // Min/max distance from player
            let angle = Phaser.Math.FloatBetween(0, Math.PI * 2); // Random direction

            let x = this.player.x + Math.cos(angle) * spawnDistance;
            let y = this.player.y + Math.sin(angle) * spawnDistance;

            // Keep enemies within map bounds (640x480)
            x = Phaser.Math.Clamp(x, 32, 608);
            y = Phaser.Math.Clamp(y, 32, 448);

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

        this.player.update(); // Ensure the health bar follows

        // Make enemies chase the player
        this.enemies.forEach((enemy) => {
            enemy.update();
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

        if (allEnemiesDestroyed && !this.isSpawningEnemies) {
            this.isSpawningEnemies = true; // Prevent multiple triggers
            this.level++;

            // Show upgrade options
            this.ui.showUpgradeOptions(); // Display the upgrade options

            this.countdownText.setText('Next wave...'); // Update the text
            this.countdownText.setVisible(true);

            // Wait until upgrade is chosen before progressing
            this.time.delayedCall(2000, () => {
                if (!this.upgradeChosen) {
                    // If the player hasn't selected an upgrade, don't proceed yet
                    this.countdownText.setText('Please choose an upgrade.');
                }
            });
        }
    }
    levelComplete() {
        // Transition to ability selection scene
        // this.scene.start('AbilitySelectionScene');
        this.restart();
    }

    restart() {
        if (this.isGameOver) return; // Prevent multiple restarts
        this.countdownText.setText('Game Over!'); // Update the text
        this.countdownText.setVisible(true);
        this.isGameOver = true; // Prevent multiple game over triggers

        // Destroy all enemies and items
        this.enemies.forEach((enemy) => enemy.destroy());
        this.items.forEach((item) => item.destroy());

        // Reset other scene objects
        this.dungeon = [];
        this.level = 1;
        // Delay the scene restart slightly to avoid conflicts
        this.time.delayedCall(2000, () => {
            this.backgroundMusic.stop();
            this.scene.restart();
        });
    }
    reducePlayerHealth(amount, direction) {
        if (this.isGameOver) return; // Prevent multiple restarts
        this.player.takeDamage(amount, direction);

        if (this.player.health <= 0) {
            this.restart();
        }
    }
}
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 550,
    scale: {
        parent: 'game-container',
        mode: Phaser.Scale.NONE, // No auto-scaling
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the map in the container
    },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: DungeonScene
};
const gameState = {
    selectedAbility: null,
    abilityPool: []
};
const game = new Phaser.Game(config);
