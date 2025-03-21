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

        // Enable physics
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);

        // Set custom collision box for the player
        this.setSize(24, 32); // Smaller collision box
        this.setOffset(4, 0); // Offset the collision box to align with the sprite

        // Health Bar Background (No physics needed)
        this.healthBarBg = scene.add.graphics();
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(0, 0, 40, 6);

        // Health Bar (Green for HP) (No physics needed)
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Create animations
        this.createAnimations();

        // Listen for the "A" key input
        this.attackKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );

        // A flag to check if the player is attacking
        this.isAttacking = false;

        // Listen for animation completion specifically for player_attack
        this.on(
            'animationcomplete-player_attack',
            this.onAnimationComplete,
            this
        );

        // Create a hitbox for the attack (initially inactive)
        this.attackHitbox = scene.add
            .zone(0, 0)
            .setSize(64, 32)
            .setVisible(true); // Define size of hitbox and make it visible
        scene.physics.world.enable(this.attackHitbox); // Enable physics for the hitbox
        this.attackHitbox.setOrigin(0.5, 0.5); // Set the origin to the center for easier positioning
        this.attackHitbox.body.setAllowGravity(false); // Disable gravity for hitbox

        // Create the graphics object for the hitbox outline
        this.hitboxOutline = scene.add.graphics();
        this.hitboxOutline.lineStyle(2, 0xff0000, 1); // Red outline with 2px thickness

        // Set a very high depth to ensure it’s on top
        this.attackHitbox.setDepth(1000); // Ensure hitbox is drawn on top
        this.hitboxOutline.setDepth(1000); // Ensure the outline is also on top
    }

    createAnimations() {
        // Create the run, hurt, attack, and idle animations (Ensure these are not duplicated)
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

        if (!this.scene.anims.get('player_hurt')) {
            this.scene.anims.create({
                key: 'player_hurt',
                frames: this.scene.anims.generateFrameNumbers('player_hurt', {
                    start: 0,
                    end: 3
                }),
                frameRate: 5,
                repeat: 0
            });
        }

        if (!this.scene.anims.get('player_attack')) {
            this.scene.anims.create({
                key: 'player_attack',
                frames: this.scene.anims.generateFrameNumbers('player_attack', {
                    start: 0,
                    end: 6
                }),
                frameRate: 20,
                repeat: 0
            });
        }

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

    onAnimationComplete() {
        console.log('Attack animation complete!');
        this.isAttacking = false; // Reset attacking flag after the animation is done
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
        // Update health bar position
        this.healthBarBg.setPosition(this.x - 20, this.y - 25);
        this.healthBar.setPosition(this.x - 20, this.y - 25);

        // Handle movement
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            if (!this.isAttacking) {
                // Don't play run animation if attacking
                this.play('player_run', true);
            }
        } else if (!this.isAttacking) {
            // Play idle animation only if not attacking
            this.play('player_idle', true);
        }

        // Handle attack input
        if (
            Phaser.Input.Keyboard.JustDown(this.attackKey) &&
            !this.isAttacking
        ) {
            this.isAttacking = true;
            this.attack();
        }
    }

    // Trigger attack
    attack() {
        console.log('Attack triggered!');
        this.play('player_attack', true); // Play the attack animation

        // Enable and position the hitbox
        this.attackHitbox.setVisible(true); // Show the hitbox
        this.attackHitbox.setPosition(this.x + 10, this.y); // Adjust based on attack range

        // Draw the hitbox outline (debugging purposes)
        this.hitboxOutline.clear(); // Clear any previous outline
        this.hitboxOutline.strokeRect(
            this.attackHitbox.x - this.attackHitbox.width / 2,
            this.attackHitbox.y - this.attackHitbox.height / 2,
            this.attackHitbox.width,
            this.attackHitbox.height
        );

        // Check for collisions with enemies
        this.scene.physics.world.overlap(
            this.attackHitbox,
            this.scene.enemies,
            this.handleHitDetection,
            null,
            this
        );
    }

    // Handle hit detection when attack hitbox overlaps with an enemy
    handleHitDetection(hitbox, enemy) {
        console.log('Enemy hit!');
        enemy.takeDamage(this.damage); // Deal damage to the enemy
    }
}
