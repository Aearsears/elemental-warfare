export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tileSize, type) {
        super(scene, x, y, 'enemyTexture'); // Use actual texture or color key

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

        // Health Bar Background
        this.healthBarBg = scene.add.graphics();
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(0, 0, 32, 5);

        // Health Bar (Red for HP)
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Create animations for the enemy (idle, move, hurt)
        this.createAnimations();

        // Default animation (e.g., idle)
        this.play('idle');
    }

    createAnimations() {
        // Idle animation
        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('orc', {
                start: 0,
                end: 5 // Adjust frame range for idle animation
            }),
            frameRate: 5,
            repeat: -1 // Loop the idle animation
        });

        // Move animation (when enemy is moving)
        this.scene.anims.create({
            key: 'move',
            frames: this.scene.anims.generateFrameNumbers('orc_walk', {
                start: 0,
                end: 7 // Adjust frame range for movement animation
            }),
            frameRate: 10,
            repeat: -1
        });

        // Hurt animation (when enemy takes damage)
        this.scene.anims.create({
            key: 'hurt',
            frames: this.scene.anims.generateFrameNumbers('orc_hurt', {
                start: 0,
                end: 3 // Adjust frame range for hurt animation
            }),
            frameRate: 5,
            repeat: 0 // Don't loop the hurt animation
        });

        // Death animation (when enemy dies)
        this.scene.anims.create({
            key: 'die',
            frames: this.scene.anims.generateFrameNumbers('orc_death', {
                start: 0,
                end: 3 // Adjust frame range for death animation
            }),
            frameRate: 5,
            repeat: 0 // Don't loop the death animation
        });
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(0, 0, 32 * (this.health / this.maxHealth), 5);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.updateHealthBar();

        // Play hurt animation when taking damage
        this.play('hurt', true);

        if (this.health <= 0) {
            this.die();
        }
    }

    moveToward(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.setVelocity(
                (dx / distance) * this.speed,
                (dy / distance) * this.speed
            );

            // Play move animation when moving
            this.play('move', true);
        }
    }

    die() {
        // Play death animation
        this.play('die', true);

        // Destroy the enemy after death animation is completed
        this.on('animationcomplete', () => {
            this.destroy();
            this.healthBar.destroy();
            this.healthBarBg.destroy();
        });
    }

    update() {
        // Make sure the health bar follows the enemy
        this.healthBarBg.setPosition(this.x - 16, this.y - 20);
        this.healthBar.setPosition(this.x - 16, this.y - 20);

        // If the enemy is idle (not moving), play the idle animation
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.play('idle', true);
        }
    }
}
