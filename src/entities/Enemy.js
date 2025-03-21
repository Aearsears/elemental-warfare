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
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(0, 0, 32 * (this.health / this.maxHealth), 5);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.updateHealthBar();
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
        }
    }

    die() {
        this.destroy();
        this.healthBar.destroy();
        this.healthBarBg.destroy();
    }

    update() {
        // Make sure the health bar follows the enemy
        this.healthBarBg.setPosition(this.x - 16, this.y - 20);
        this.healthBar.setPosition(this.x - 16, this.y - 20);
    }
}
