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

        // Listen for the "A" key input
        this.attackKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );

        // A flag to check if the player is attacking
        this.isAttacking = false;

        // Listen for animation completion
        this.on(
            Phaser.Animations.Events.SPRITE_ANIMATION_KEY_COMPLETE,
            this.onAnimationComplete,
            this
        );
    }

    createAnimations() {
        // Check if the 'player_run' animation already exists
        if (!this.scene.anims.get('player_run')) {
            this.scene.anims.create({
                key: 'player_run',
                frames: this.scene.anims.generateFrameNumbers('player_run', {
                    start: 0,
                    end: 15
                }),
                frameRate: 10,
                repeat: 0
            });
        }

        // Check if the 'player_hurt' animation already exists
        if (!this.scene.anims.get('player_hurt')) {
            this.scene.anims.create({
                key: 'player_hurt',
                frames: this.scene.anims.generateFrameNumbers('player_hurt', {
                    start: 0,
                    end: 3
                }),
                frameRate: 5,
                repeat: 0 // Don't loop the hurt animation
            });
        }

        // Check if the 'player_attack' animation already exists
        if (!this.scene.anims.get('player_attack')) {
            this.scene.anims.create({
                key: 'player_attack',
                frames: this.scene.anims.generateFrameNumbers('player_attack', {
                    start: 0,
                    end: 6
                }),
                frameRate: 10, // Adjust based on your preference
                repeat: 0 // Don't loop the attack animation
            });
        }

        // Check if the 'player_idle' animation already exists
        if (!this.scene.anims.get('player_idle')) {
            this.scene.anims.create({
                key: 'player_idle',
                frames: this.scene.anims.generateFrameNumbers('player', {
                    start: 0,
                    end: 9
                }),
                frameRate: 10,
                repeat: 0
            });
        }
    }

    onAnimationComplete(animation, frame) {
        console.log('Animation complete:', animation.key);
        if (animation.key === 'player_attack') {
            // Delay the resetting of isAttacking to simulate a more accurate attack completion
            this.scene.time.delayedCall(200, () => {
                if (this.isAttacking) {
                    this.isAttacking = false; // Reset the attacking flag after the delay
                }
                console.log('Attack finished!');
            });
        }
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
            this.play('player_run', true); // Play the run animation when moving
        } else {
            this.play('player_idle', true); // Play the idle animation when stationary
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.attackKey) &&
            !this.isAttacking
        ) {
            this.isAttacking = true; // Set the player as attacking
            this.attack();
        }
    }

    // Trigger attack
    attack() {
        console.log('Attack triggered!');
        this.play('player_attack', true); // Play the attack animation
        console.log('Attackdone!');
    }
}
