import {
    HealAbility,
    BombAbility,
    ShieldAbility
} from '../abilities/Ability.js';
import { UI } from '../UI.js';
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
            Phaser.Input.Keyboard.KeyCodes.A
        );

        // Available abilities pool
        this.abilityPool = [];
        this.followingAbilities = [];
        this.abilityUI = new UI(scene, this);
        this.isUsingAbility = false;
        // Update UI for abilities
        this.updateAbilityUI();

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
        const currentTime = this.scene.time.now;
        // Update health bar position
        this.healthBarBg.setPosition(this.x - 20, this.y - 25);
        this.healthBar.setPosition(this.x - 20, this.y - 25);
        this.updateHealthBar();

        this.abilityUI.update();

        if (this.isDashing) return; // Prevent movement when attacking

        // Handle movement
        let moveX = this.body.velocity.x;
        let moveY = this.body.velocity.y;
        // Determine direction
        let direction = this.lastDirection; // Default to last direction
        direction = this.getDirection(moveX, moveY);

        if (moveX !== 0 || moveY !== 0) {
            this.lastDirection = direction;
            if (!this.isDashing && !this.isUsingAbility) {
                this.play(`player_walk_${direction}`, true);
            }
        } else {
            if (!this.isDashing && !this.isUsingAbility) {
                this.play(`player_idle_${this.lastDirection}`, true);
            }
        }

        // Handle attack input
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) && !this.isDashing) {
            this.isDashing = true;
            this.dash(direction ? direction : this.lastDirection);
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.abilityKey) &&
            !this.isDashing
        ) {
            if (this.abilityPool.length === 0) {
                console.log('No abilities available!');
                return;
            }
            const ability = Phaser.Utils.Array.GetRandom(this.abilityPool);

            this.isUsingAbility = true;
            console.log(`Using ${ability.name} ability!`);

            ability.use(currentTime);
            // Remove the selected ability from the pool
            Phaser.Utils.Array.Remove(this.abilityPool, ability);
        }
        if (this.followingAbilities) {
            this.followingAbilities.forEach((ability) => {
                ability.setPosition(this.x, this.y);
            });
        }
    }
    heal() {
        console.log('Player healed!');
        this.health = Math.min(this.maxHealth, this.health + 20);
        this.playAbilityEffect('heal', true);
        this.isUsingAbility = false;
    }

    bomb() {
        console.log('Player attacked!');
        // Implement attack behavior here
        this.playAbilityEffect('bomb', false);
        this.isUsingAbility = false;
    }

    shield() {
        console.log('Player shielded!');
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

        // If only moving left or right, infer vertical direction based on last movement
        if (vx < 0)
            return this.lastDirection.includes('Up') ? 'Left_Up' : 'Left_Down';
        if (vx > 0)
            return this.lastDirection.includes('Up')
                ? 'Right_Up'
                : 'Right_Down';

        return this.direction; // Default to last known direction if no movement
    }
    dash(direction) {
        console.log('dash triggered!');
        this.play(`player_dash_${direction}`, true);

        this.playDustEffect(direction);
        // Set a temporary dash speed boost
        this.body.velocity.x *= 2; // Increase dash speed (adjust multiplier)
        this.body.velocity.y *= 2;

        // Reset dash after some time (let's say after 300ms, you can adjust this)
        this.scene.time.delayedCall(300, () => {
            this.body.velocity.x /= 2;
            this.body.velocity.y /= 2;
            this.isDashing = false; // End dash
        });
    }
    playAbilityEffect(name, shouldFollow = true) {
        const ability = this.scene.add.sprite(this.x, this.y, 'player'); // Temporary sprite for effect
        ability.setOrigin(0.5, 0.5);
        ability.play(name, true);

        if (shouldFollow) {
            // Store abilities that should follow the player
            if (!this.followingAbilities) this.followingAbilities = [];
            this.followingAbilities.push(ability);
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
    // Enable and position the hitbox
    // this.attackHitbox.setVisible(true); // Show the hitbox
    // this.attackHitbox.setPosition(this.x + 10, this.y); // Adjust based on attack range

    // // Draw the hitbox outline (debugging purposes)
    // this.hitboxOutline.clear(); // Clear any previous outline
    // this.hitboxOutline.strokeRect(
    //     this.attackHitbox.x - this.attackHitbox.width / 2,
    //     this.attackHitbox.y - this.attackHitbox.height / 2,
    //     this.attackHitbox.width,
    //     this.attackHitbox.height
    // );

    // // Check for collisions with enemies
    // this.scene.physics.world.overlap(
    //     this.attackHitbox,
    //     this.scene.enemies,
    //     this.handleHitDetection,
    //     null,
    //     this
    // );

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
    handleHitDetection(hitbox, enemy) {
        console.log('Enemy hit!');
        enemy.takeDamage(this.damage); // Deal damage to the enemy
    }
}
