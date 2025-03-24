export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tileSize, type) {
        super(scene, x, y, 'orc'); // Use actual texture or color key

        this.scene = scene;
        this.type = type;
        this.health = type.health;
        this.maxHealth = type.health;
        this.damage = type.damage;
        this.speed = type.speed;

        // Enable physics and add enemy to scene
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);

        // Set custom collision box for the enemy (adjust width/height as needed)
        this.setSize(24, 32); // Smaller collision box
        this.setOrigin(0.5, 0.5);
        this.setOffset(24, 32); // Offset the collision box to align with the sprite

        // Health Bar Background
        this.healthBarBg = scene.add.graphics();
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(0, 0, 32, 5);

        // Health Bar (Red for HP)
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Create animations for the enemy (idle, move, hurt)
        this.createAnimations();

        // Flag to prevent multiple damage in the same frame
        this.isHit = false;
    }

    createAnimations() {
        // Idle animation (only create if it doesn't exist)
        if (!this.scene.anims.get('orc_idle')) {
            this.scene.anims.create({
                key: 'orc_idle',
                frames: this.scene.anims.generateFrameNumbers('orc', {
                    start: 0,
                    end: 5 // Adjust frame range for idle animation
                }),
                frameRate: 5,
                repeat: -1 // Loop the idle animation
            });
        }

        // Move animation (only create if it doesn't exist)
        if (!this.scene.anims.get('orc_move')) {
            this.scene.anims.create({
                key: 'orc_move',
                frames: this.scene.anims.generateFrameNumbers('orc_walk', {
                    start: 0,
                    end: 7 // Adjust frame range for movement animation
                }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Hurt animation (only create if it doesn't exist)
        if (!this.scene.anims.get('orc_hurt')) {
            this.scene.anims.create({
                key: 'orc_hurt',
                frames: this.scene.anims.generateFrameNumbers('orc_hurt', {
                    start: 0,
                    end: 3 // Adjust frame range for hurt animation
                }),
                frameRate: 5,
                repeat: 0 // Don't loop the hurt animation
            });
        }

        // Death animation (only create if it doesn't exist)
        if (!this.scene.anims.get('orc_die')) {
            this.scene.anims.create({
                key: 'orc_die',
                frames: this.scene.anims.generateFrameNumbers('orc_death', {
                    start: 0,
                    end: 3 // Adjust frame range for death animation
                }),
                frameRate: 5,
                repeat: 0 // Don't loop the death animation
            });
        }
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(0, 0, 32 * (this.health / this.maxHealth), 5);
    }

    takeDamage(amount, damageDirection) {
        if (this.isHit) return; // Prevent taking damage multiple times in the same frame

        console.log('Enemy health:', this.health);
        this.isHit = true; // Set the hit flag
        this.health -= amount;
        this.updateHealthBar();
        console.log('Enemy took damage:', this.health);

        // Play hurt animation when taking damage
        this.play('orc_hurt', true);

        // Apply knockback effect
        const knockbackStrength = 100; // Adjust this for the desired knockback strength
        const knockbackDuration = 200; // Knockback effect duration in ms

        if (damageDirection) {
            // Apply knockback in the opposite direction of the damage
            this.setVelocity(
                damageDirection.x * knockbackStrength,
                damageDirection.y * knockbackStrength
            );

            // Stop the knockback after a short duration
            this.scene.time.delayedCall(knockbackDuration, () => {
                this.setVelocity(0, 0); // Stop movement after knockback
            });
        }

        if (this.health <= 0) {
            this.die();
        } else {
            this.scene.time.delayedCall(500, () => {
                this.isHit = false;
            });
        }
    }

    moveToward(target, stopDistance = 100) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > stopDistance) {
            this.setVelocity(
                (dx / distance) * this.speed,
                (dy / distance) * this.speed
            );

            // Play move animation when moving
            this.play('orc_move', true);
        } else {
            this.setVelocity(0, 0); // Stop movement
        }
    }

    die() {
        // Play death animation
        console.log('Enemy died!');
        this.play('orc_die', true);

        // Add a listener for when the death animation completes
        this.on('animationcomplete-orc_die', () => {
            // Optional: Add any other logic that happens after the animation finishes
            console.log(
                'Death animation complete, waiting for delay to destroy the enemy...'
            );

            // Add a delay before destroying the enemy
            this.scene.time.delayedCall(500, () => {
                // 500ms delay before destruction
                this.setActive(false); // Disables the enemy in the physics world
                this.setVisible(false); // Hides the enemy
                this.destroy(); // Destroy enemy after animation
                this.healthBar.destroy(); // Destroy health bar
                this.healthBarBg.destroy(); // Destroy health bar background
            });
        });
    }

    update() {
        if (!this.body) return; // Prevents errors if body is missing
        // Make sure the health bar follows the enemy
        this.healthBarBg.setPosition(this.x - 16, this.y - 20);
        this.healthBar.setPosition(this.x - 16, this.y - 20);

        // If the enemy is idle (not moving), play the idle animation
        if (
            this.body.velocity.x === 0 &&
            this.body.velocity.y === 0 &&
            this.health > 0
        ) {
            if (!this.isHit) {
                this.play('orc_idle', true);
            }
        }
    }
}
