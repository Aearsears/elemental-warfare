import {
    HealAbility,
    BombAbility,
    ShieldAbility
} from '../abilities/Ability.js';
import { UI } from '../UI.js';
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tileSize) {
        super(scene, x, y, 'player_idle_Down');
        this.scene = scene;
        this.health = 100;
        this.speed = 200;
        this.maxHealth = 100;
        this.damage = 25;
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
        this.isFrozen = false;
        this.isHit = false;

        // Enable physics
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);

        // Set collision box
        this.setSize(16, 32);
        this.setOrigin(0.5, 0.5);
        this.setOffset(16, 20);

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
        this.dashKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.abilityKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.AttackKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );

        // Available abilities pool
        this.abilityPool = [];
        this.followingAbilities = [];
        this.abilityUI = new UI(scene, this);
        this.isUsingAbility = false;
        // Update UI for abilities
        this.updateAbilityUI();

        //need to shuffle the abilites
        Phaser.Utils.Array.Shuffle(this.abilityPool);

        // Dashing flag
        this.isDashing = false;

        // Listen for animation completion specifically for player_attack
        this.on(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            this.onAnimationComplete,
            this
        );

        // Create a hitbox for the attack (initially inactive)
        this.attackHitbox = scene.add
            .zone(0, 0)
            .setSize(64, 64)
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

        // Bullet group for managing bullets
        this.bullets = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite, // Bullet type
            runChildUpdate: true, // Ensure the group is updated
            maxSize: 10 // Limit max number of bullets to avoid memory overflow
        });
        this.bombSound = scene.sound.add('bomb_sound');
        this.bulletSound = scene.sound.add('bullet_sound');
        this.healSound = scene.sound.add('heal_sound');
        this.walkSound = scene.sound.add('walk_sound');
        this.shieldSound = scene.sound.add('shield_sound');
        this.dashSound = scene.sound.add('dash_sound');
        this.hitSound = scene.sound.add('hit_sound');
    }

    // Randomly select three abilities from the pool
    getRandomAbilities() {
        const shuffled = Phaser.Utils.Array.Shuffle(this.abilityPool); // Shuffle the ability pool
        return shuffled.slice(0, 3); // Select the first three after shuffle
    }

    // Update the ability UI (Optional: display names, cooldowns, etc.)
    updateAbilityUI() {
        console.log('Selected Abilities: ', this.abilityPool);
    }

    createAbilityPool(pool) {
        // this.abilityPool = [
        //     new HealAbility(this),
        //     new AttackAbility(this),
        //     new ShieldAbility(this)
        // ];
        this.abilityPool = pool;
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
            if (!this.scene.anims.get(`player_dash_${dir}`)) {
                this.scene.anims.create({
                    key: `player_dash_${dir}`,
                    frames: this.scene.anims.generateFrameNumbers(
                        `player_dash_${dir}`,
                        { start: 0, end: 7 }
                    ),
                    frameRate: 10,
                    repeat: 0
                });
            }
            if (!this.scene.anims.get(`player_dash_dust_${dir}`)) {
                this.scene.anims.create({
                    key: `player_dash_dust_${dir}`,
                    frames: this.scene.anims.generateFrameNumbers(
                        `player_dash_dust_${dir}`,
                        { start: 0, end: 7 }
                    ),
                    frameRate: 10,
                    repeat: 0
                });
            }
        });
        if (!this.scene.anims.get(`bomb`)) {
            this.scene.anims.create({
                key: `bomb`,
                frames: this.scene.anims.generateFrameNumbers(`bomb`, {
                    start: 0,
                    end: 11
                }),
                frameRate: 10,
                repeat: 0
            });
        }
        if (!this.scene.anims.get(`heal`)) {
            this.scene.anims.create({
                key: `heal`,
                frames: this.scene.anims.generateFrameNumbers(`heal`, {
                    start: 0,
                    end: 11
                }),
                frameRate: 10,
                repeat: 0
            });
        }
        if (!this.scene.anims.get(`shield`)) {
            this.scene.anims.create({
                key: `shield`,
                frames: this.scene.anims.generateFrameNumbers(`shield`, {
                    start: 0,
                    end: 11
                }),
                frameRate: 10,
                repeat: 0
            });
        }
    }

    onAnimationComplete() {}

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x00ff00, 1);
        this.healthBar.fillRect(0, 0, 40 * (this.health / this.maxHealth), 6);
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
        const currentTime = this.scene.time.now;
        // Update health bar position
        this.healthBarBg.setPosition(this.x - 20, this.y - 25);
        this.healthBar.setPosition(this.x - 20, this.y - 25);
        this.updateHealthBar();

        this.abilityUI.update();

        if (this.isFrozen) {
            this.setVelocity(0, 0); // Prevent movement
            return;
        }

        if (this.attackHitbox.visible) {
            this.scene.physics.world.overlap(
                this.attackHitbox,
                this.scene.enemies,
                this.handleHitDetection,
                null,
                this
            );
        }

        if (this.isDashing || this.isHit) return; // Prevent movement when attacking

        // Player movement
        let moveX = 0;
        let moveY = 0;

        if (this.scene.cursors.left.isDown) moveX = -1;
        if (this.scene.cursors.right.isDown) moveX = 1;
        if (this.scene.cursors.up.isDown) moveY = -1;
        if (this.scene.cursors.down.isDown) moveY = 1;

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= Math.SQRT1_2;
            moveY *= Math.SQRT1_2;
        }

        // Determine direction
        let direction = this.lastDirection; // Default to last direction
        direction = this.getDirection(moveX, moveY);

        this.lastDirection = direction;

        if (
            !this.isDashing &&
            !this.isUsingAbility &&
            !this.isHit &&
            (moveX != 0 || moveY != 0)
        ) {
            if (!this.walkSound.isPlaying) {
                this.walkSound.play({ loop: true }); // Ensures the sound loops
            }
            this.setVelocity(moveX * this.speed, moveY * this.speed);
            this.play(`player_walk_${direction}`, true);
        } else {
            if (this.walkSound.isPlaying) {
                this.walkSound.stop();
            }
            if (!this.isDashing && !this.isUsingAbility && !this.isHit) {
                this.setVelocity(0, 0);
                this.play(`player_idle_${this.lastDirection}`, true);
            }
        }

        // Handle attack input
        if (Phaser.Input.Keyboard.JustDown(this.AttackKey)) {
            console.log('Attack triggered!');
            this.shootBullet();
        }

        // Handle dash input
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) && !this.isDashing) {
            this.isDashing = true;
            this.dash(direction ? direction : this.lastDirection);
        }

        // Handle ability input
        if (
            Phaser.Input.Keyboard.JustDown(this.abilityKey) &&
            !this.isDashing &&
            this.abilityPool.length != 0
        ) {
            const ability = this.abilityPool[this.abilityPool.length - 1];

            this.isUsingAbility = true;
            console.log(`Using ${ability.name} ability!`);

            ability.use(currentTime);
            // Remove the selected ability from the pool
            Phaser.Utils.Array.Remove(this.abilityPool, ability);
            this.isUsingAbility = false;
        }
        if (this.followingAbilities) {
            this.followingAbilities.forEach((ability) => {
                ability.setPosition(this.x, this.y);
            });
        }
    }
    heal(value) {
        console.log('Player healed!');
        this.healSound.play();
        this.health = Math.min(this.maxHealth, this.health + value);
        this.playAbilityEffect('heal', true);
        this.isUsingAbility = false;
    }

    bomb(damage) {
        console.log('Player attacked!');
        this.bombSound.play();
        // Implement attack behavior here
        this.playAbilityEffect('bomb', false, damage);
        this.isUsingAbility = false;
    }

    shield(value) {
        console.log('Player shielded!');
        this.shieldSound.play();
        // Implement shield behavior here
        this.playAbilityEffect('shield', true);
        this.isUsingAbility = false;
    }
    getDirection(vx, vy) {
        if (vy < 0 && vx === 0) return 'Up';
        if (vy > 0 && vx === 0) return 'Down';
        if (vx < 0 && vy < 0) return 'Left_Up';
        if (vx < 0 && vy > 0) return 'Left_Down';
        if (vx > 0 && vy < 0) return 'Right_Up';
        if (vx > 0 && vy > 0) return 'Right_Down';

        // If moving purely left or right, determine vertical direction from last movement
        if (vx < 0) {
            return this.lastDirection.startsWith('Right') ||
                this.lastDirection === 'Up'
                ? 'Left_Up'
                : 'Left_Down';
        }
        if (vx > 0) {
            return this.lastDirection.startsWith('Left') ||
                this.lastDirection === 'Up'
                ? 'Right_Up'
                : 'Right_Down';
        }

        return this.lastDirection; // Default to last known direction
    }
    dash(direction) {
        this.play(`player_dash_${direction}`, true);
        this.dashSound.play();
        // Disable collision with enemies
        // this.body.checkCollision.none = true;
        this.playDustEffect(direction);
        // Set a temporary dash speed boost
        this.body.velocity.x *= 2; // Increase dash speed (adjust multiplier)
        this.body.velocity.y *= 2;

        // Reset dash after some time (let's say after 300ms, you can adjust this)
        this.scene.time.delayedCall(300, () => {
            this.body.velocity.x /= 2;
            this.body.velocity.y /= 2;
            this.isDashing = false; // End dash
            // Re-enable collision with enemies
            this.body.checkCollision.none = false;
        });
    }
    playAbilityEffect(name, shouldFollow = true, damage = 0) {
        // Store the direction
        let direction = new Phaser.Math.Vector2(0, 0); // Initialize direction vector

        switch (this.lastDirection) {
            case 'Up':
                direction.set(0, -1);
                break;
            case 'Down':
                direction.set(0, 1);
                break;
            case 'Left_Down': // Treat as Left
            case 'Left_Up':
            case 'Left':
                direction.set(-1, 0);
                break;
            case 'Right_Down': // Treat as Right
            case 'Right_Up':
            case 'Right':
                direction.set(1, 0);
                break;
            default:
                velocityX = 0;
                velocityY = 0;
                break;
        }
        let offset = name == 'bomb' ? 50 : 0; // Offset distance in pixels
        let abilityX = this.x + direction.x * offset;
        let abilityY = this.y + direction.y * offset;
        const ability = this.scene.add.sprite(abilityX, abilityY, 'player'); // Temporary sprite for effect
        ability.setOrigin(0.5, 0.5);
        ability.play(name, true);

        if (shouldFollow) {
            // Store abilities that should follow the player
            if (!this.followingAbilities) this.followingAbilities = [];
            this.followingAbilities.push(ability);
        } else {
            // Enable and position the hitbox
            this.attackHitbox.setVisible(true); // Show the hitbox
            this.attackHitbox.setPosition(abilityX, abilityY); // Adjust based on attack range
            // Store the ability's damage inside the hitbox
            this.attackHitbox.damage = damage;
            // Enable physics body
            this.attackHitbox.body.enable = true;
            // Draw the hitbox outline (debugging purposes)
            this.hitboxOutline.clear(); // Clear any previous outline
            this.hitboxOutline.strokeRect(
                this.attackHitbox.x - this.attackHitbox.width / 2,
                this.attackHitbox.y - this.attackHitbox.height / 2,
                this.attackHitbox.width,
                this.attackHitbox.height
            );
            // Set a timer to disable the hitbox after a short time
            this.scene.time.delayedCall(200, () => {
                this.attackHitbox.setVisible(false);
                this.attackHitbox.body.enable = false;
            });
        }

        // Destroy the ability after animation completes
        ability.on('animationcomplete', () => {
            ability.destroy();
            if (shouldFollow) {
                this.followingAbilities = this.followingAbilities.filter(
                    (a) => a !== ability
                );
            }
        });

        return ability;
    }

    // Function to simulate a dust effect with dash animation
    playDustEffect(direction) {
        // Create a temporary sprite to simulate the dust effect near the player
        const dust = this.scene.add.sprite(this.x, this.y + 10, 'player'); // Use the player sprite temporarily for the dust effect
        dust.setOrigin(0.5, 0.5); // Center the dust effect at the player's feet

        // Play the dash animation at the player's feet for a short burst
        dust.play(`player_dash_dust_${direction}`, true); // Use the dash animation for the dust effect

        // Destroy the temporary dust sprite after the animation completes
        dust.on('animationcomplete', () => {
            dust.destroy(); // Remove the dust effect after it completes
        });
    }
    // Handle hit detection when attack hitbox overlaps with an enemy
    handleHitDetection(attackHitbox, enemy) {
        if (enemy && attackHitbox.damage) {
            enemy.takeDamage(attackHitbox.damage); // Apply stored damage
        }
    }
    shootBullet() {
        // Create a new bullet from the bullet group
        this.bulletSound.play({ volume: 0.5 });
        const bullet = this.bullets.getFirstDead(true, this.x, this.y); // Use 'bullet' texture

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            const speed = 400; // Bullet speed (adjust as needed)
            // Calculate the bullet's velocity based on the last direction
            let velocityX = 0;
            let velocityY = 0;

            // Store the direction
            let direction = new Phaser.Math.Vector2(0, 0); // Initialize direction vector

            switch (this.lastDirection) {
                case 'Up':
                    velocityX = 0;
                    velocityY = -speed;
                    direction.set(0, -1);
                    break;
                case 'Down':
                    velocityX = 0;
                    velocityY = speed;
                    direction.set(0, 1);
                    break;
                case 'Left_Down': // Treat as Left
                case 'Left_Up':
                case 'Left':
                    velocityX = -speed;
                    velocityY = 0;
                    direction.set(-1, 0);
                    break;
                case 'Right_Down': // Treat as Right
                case 'Right_Up':
                case 'Right':
                    velocityX = speed;
                    velocityY = 0;
                    direction.set(1, 0);
                    break;
                default:
                    velocityX = 0;
                    velocityY = 0;
                    break;
            }

            // Apply the calculated velocity to the bullet
            bullet.body.setVelocity(velocityX, velocityY);
            bullet.body.setCollideWorldBounds(true); // Collide with world bounds (to destroy outside the screen)
            // Store direction in bullet for later use
            bullet.direction = direction;
            // Play the bullet animation (if using sprite sheet for animation)
            bullet.play('bulletMove');

            // Add the bullet-world bounds collision handler
            bullet.on('worldbounds', () =>
                this.handleBulletWorldBoundsCollision(bullet)
            );

            this.scene.physics.add.overlap(
                bullet,
                this.scene.enemies,
                this.handleBulletHit,
                null,
                this
            );
        }
    }

    // Optional: Handle bullet-enemy collision and destroy bullet
    handleBulletHit(bullet, enemy) {
        bullet.setActive(false); // Deactivate the bullet
        bullet.setVisible(false); // Hide the bullet
        bullet.body.stop(); // Stop the bullet's movement
        bullet.destroy();

        // Handle damage to the enemy
        enemy.takeDamage(this.damage, bullet.direction); // For example, apply damage to the enemy
        this.hitSound.play({ volume: 0.5 });
    }

    takeDamage(amount, damageDirection) {
        if (this.isHit) return; // Prevent taking damage multiple times in the same frame

        this.isHit = true; // Set the hit flag
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();

        this.setTintFill(0xff0000);
        this.scene.time.delayedCall(200, () => {
            this.clearTint(); // Remove the tint after 100ms
        });
        const knockbackStrength = 200; // Adjust this for the desired knockback strength
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

        this.scene.time.delayedCall(500, () => {
            this.isHit = false;
        });
    }
    // In the Player class, a new method for progression
    getUpgradeOptions() {
        const options = [
            {
                name: 'Increase Health',
                action: this.increaseHealth.bind(this),
                cost: 0
            },
            {
                name: 'Increase Damage',
                action: this.increaseDamage.bind(this),
                cost: 0
            },
            {
                name: 'Unlock Shield Ability',
                action: this.unlockShield.bind(this),
                cost: 0
            },
            {
                name: 'Reduce Bomb Cooldown',
                action: this.reduceBombCooldown.bind(this),
                cost: 0
            }
        ];

        // Select a random subset of 3 options (or just choose the ones you want)
        return Phaser.Utils.Array.Shuffle(options).slice(0, 3);
    }

    increaseHealth() {
        this.maxHealth += 20;
        this.health = this.maxHealth; // Restore health to full
        this.updateHealthBar();
    }

    increaseDamage() {
        this.damage += 5;
    }

    unlockShield() {
        this.abilityPool.push(new ShieldAbility(this)); // Assuming you have a ShieldAbility class
    }

    reduceBombCooldown() {
        this.bombAbilityCooldown -= 1; // Assuming bomb has a cooldown attribute
    }
}
