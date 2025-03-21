export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tileSize) {
        super(scene, x, y, 'player');

        this.scene = scene;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 20;
        this.keys = 0;
        this.experience = 0;
        this.level = 1;
        this.inventory = [];

        // Enable physics only for the player sprite
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);

        // Set custom collision box for the player (adjust width/height as needed)
        this.setSize(24, 32); // Smaller collision box
        this.setOffset(4, 0); // Offset the collision box to align with the sprite

        // Health Bar Background (No physics needed)
        this.healthBarBg = scene.add.graphics();
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(0, 0, 40, 6);

        // Health Bar (Green for HP) (No physics needed)
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Create animations for run, hurt, and attack
        this.createAnimations();

        // Play the idle animation by default
        this.play('idle');
    }
    createAnimations() {
        // Run animation
        this.scene.anims.create({
            key: 'run',
            frames: this.scene.anims.generateFrameNumbers('player_run', {
                start: 0,
                end: 15
            }), // Adjust the frame range as needed
            frameRate: 10,
            repeat: -1
        });

        // Hurt animation
        this.scene.anims.create({
            key: 'hurt',
            frames: this.scene.anims.generateFrameNumbers('player_hurt', {
                start: 0,
                end: 3
            }), // Adjust the frame range for the hurt animation
            frameRate: 5,
            repeat: 0 // Don't loop the hurt animation
        });

        // Attack animation
        this.scene.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNumbers('player_attack', {
                start: 0,
                end: 6
            }), // Adjust the frame range for the attack animation
            frameRate: 8,
            repeat: 0 // Don't loop the attack animation
        });

        // Idle animation (can be the default)
        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('player', {
                start: 0,
                end: 10
            }), // Adjust the frame range for idle
            frameRate: 10,
            repeat: -1
        });
    }
    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x00ff00, 1);
        this.healthBar.fillRect(0, 0, 40 * (this.health / this.maxHealth), 6);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
        return this.health <= 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthBar();
    }

    levelUp() {
        this.level++;
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.damage += 5;
        this.updateHealthBar();
    }

    update() {
        // Ensure the health bar follows the player
        this.healthBarBg.setPosition(this.x - 20, this.y - 25);
        this.healthBar.setPosition(this.x - 20, this.y - 25);

        // Movement handling: Check if the player is moving
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.play('run', true); // Play the run animation when moving
        } else {
            this.play('idle', true); // Play the idle animation when stationary
        }

        // Example: Trigger attack (can be from a button press or other condition)
        if (this.isAttacking) {
            this.play('attack', true); // Play the attack animation
            this.isAttacking = false; // Reset attack flag after animation
        }
    }

    // Trigger attack (you could call this from an input event)
    attack() {
        this.isAttacking = true;
    }
}
