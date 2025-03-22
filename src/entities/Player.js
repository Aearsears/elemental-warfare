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
        this.directions = [
            'Up',
            'Down',
            'Left_Down',
            'Left_Up',
            'Right_Down',
            'Right_Up'
        ];
        this.lastDirection = 'Down'; // Store last direction for idle animation

        // Enable physics
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);

        // Set collision box
        this.setSize(16, 32);
        this.setOffset(4, 0);

        // Health Bar
        this.healthBarBg = scene.add.graphics();
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(0, 0, 40, 6);
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        // Create animations
        this.createAnimations();

        // Input keys for movement
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.attackKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );

        // Attacking flag
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
        this.directions.forEach((dir) => {
            if (!this.scene.anims.get(`player_idle_${dir}`)) {
                this.scene.anims.create({
                    key: `player_idle_${dir}`,
                    frames: this.scene.anims.generateFrameNumbers(
                        `player_idle_${dir}`,
                        { start: 0, end: 7 }
                    ),
                    frameRate: 10,
                    repeat: 0
                });
            }

            if (!this.scene.anims.get(`player_walk_${dir}`)) {
                this.scene.anims.create({
                    key: `player_walk_${dir}`,
                    frames: this.scene.anims.generateFrameNumbers(
                        `player_walk_${dir}`,
                        { start: 0, end: 7 }
                    ),
                    frameRate: 10,
                    repeat: 0
                });
            }
        });
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

        if (this.isAttacking) return; // Prevent movement when attacking

        // Handle movement
        let moveX = this.body.velocity.x;
        let moveY = this.body.velocity.y;
        // Determine direction
        let direction = this.lastDirection; // Default to last direction
        direction = this.getDirection(moveX, moveY);

        if (moveX !== 0 || moveY !== 0) {
            this.lastDirection = direction;
            this.play(`player_walk_${direction}`, true);
        } else {
            this.play(`player_idle_${this.lastDirection}`, true);
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
    getDirection(vx, vy) {
        if (vy < 0 && vx === 0) return 'Up';
        if (vy > 0 && vx === 0) return 'Down';
        if (vx < 0 && vy < 0) return 'Left_Up';
        if (vx < 0 && vy > 0) return 'Left_Down';
        if (vx > 0 && vy < 0) return 'Right_Up';
        if (vx > 0 && vy > 0) return 'Right_Down';

        // If only moving left or right, infer vertical direction based on last movement
        if (vx < 0)
            return this.lastDirection.includes('Up') ? 'Left_Up' : 'Left_Down';
        if (vx > 0)
            return this.lastDirection.includes('Up')
                ? 'Right_Up'
                : 'Right_Down';

        return this.direction; // Default to last known direction if no movement
    }
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
