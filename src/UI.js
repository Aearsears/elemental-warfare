export class UI {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // Create a container to hold the icons
        this.abilityIconContainer = this.scene.add.container(
            this.scene.cameras.main.width - 220, // X position: adjust as needed
            this.scene.cameras.main.height - 40 // Y position: adjust as needed
        );

        // Create the text UI element to display remaining abilities
        this.abilityText = this.scene.add
            .text(
                this.scene.cameras.main.width - 250, // X position: right edge of the screen
                this.scene.cameras.main.height - 20, // Y position: bottom of the screen
                'Next Ability: ',
                {
                    font: '16px "Press Start 2P"', // Use the pixel font
                    fill: '#ffffff',
                    padding: { x: 10, y: 10 },
                    align: 'right'
                }
            )
            .setOrigin(1, 1)
            .setScrollFactor(0);

        this.waveText = this.scene.add
            .text(
                20, // X position: 20 pixels from the left
                this.scene.cameras.main.height - 40, // Y position: 40 pixels from the bottom
                `'Wave: ${this.scene.level}'`,
                {
                    font: '20px "Press Start 2P"',
                    fill: '#ffffff', // Yellow color for visibility
                    align: 'left'
                }
            )
            .setOrigin(0, 1) // Align to the bottom-left corner
            .setScrollFactor(0); // Fix position to camera

        // Initially, update the UI to show available abilities
        this.update();
    }

    // Update the UI text with the remaining abilities
    update() {
        const pool = this.player.abilityPool;

        // Update ability text
        if (this.player.abilityPool.length > 0) {
            this.abilityText.setText(`Next Ability:`);
            // Remove previous icons
            this.abilityIconContainer.removeAll(true);

            // Horizontal starting position for the icons (adjust as needed)
            let startX = 0;

            // only show next three abilities
            for (
                let i = pool.length - 1;
                i >= Math.max(pool.length - 3, 0);
                i--
            ) {
                const ability = pool[i];

                const icon = this.scene.add
                    .image(startX, 0, 'card') // Positioning the icons horizontally
                    .setScale(0.8); // Optional: resize the icon

                // Create text to display on top of the icon
                const abilityText = this.scene.add.text(
                    icon.x, // Positioning text horizontally at the center of the icon
                    icon.y, // Positioning text vertically at the center of the icon
                    ability.name, // Text to display (e.g., the ability name)
                    {
                        font: '12px Arial', // Adjust font size and style
                        fill: '#ffffff', // Text color
                        align: 'center' // Center text horizontally
                    }
                );

                // Set the origin of the text to be the center, so it is centered on the icon
                abilityText.setOrigin(0.5, 0.5);

                // Add both the icon and text to the container
                this.abilityIconContainer.add(icon);
                this.abilityIconContainer.add(abilityText);

                // Move the startX for the next icon, with a horizontal gap of 40px
                startX += icon.displayWidth + 10; // 10px gap between icons
            }
        } else {
            this.abilityIconContainer.removeAll(true);
            this.abilityText.setText(`No more abilities!`);
        }
        this.waveText.setText(`Wave: ${this.scene.level}`);
    }

    // Optionally, you can hide the ability UI during game over or when no abilities are left
    hide() {
        this.abilityText.setVisible(false);
        this.abilityIconContainer.setVisible(false); // Hide the icon container
    }

    // Optionally, you can show the ability UI again
    show() {
        this.abilityText.setVisible(true);
        this.abilityIconContainer.setVisible(true); // Show the icon container
    }
    showUpgradeOptions() {
        if (!this.upgradeOptions) {
            // Create upgrade options when all enemies are dead
            this.upgradeOptions = this.scene.add.container(640 / 2, 550 / 2); // Position the container on the screen
            // Add a semi-transparent black background
            // Create a semi-transparent black background
            const background = this.scene.add.rectangle(
                0, // Position inside the container
                0, // Position inside the container
                2000, // Width
                2000, // Height
                0x000000, // Black color
                0.5 // 50% Opacity
            );
            background.setOrigin(0.5, 0.5); // Center the background
            // Create the upgrade text
            const upgradeText = this.scene.add.text(
                0,
                -150, // Adjust Y position inside the container
                'Choose an upgrade:',
                {
                    font: '24px Arial',
                    fill: '#ffffff',
                    align: 'center'
                }
            );
            upgradeText.setOrigin(0.5, 0.5); // Center the text

            // Upgrade buttons (could be health, damage, etc.)
            const healthButton = this.scene.add
                .text(-100, -130, 'Increase Health by 20', {
                    font: '20px Arial',
                    fill: '#ffffff',
                    align: 'center'
                })
                .setInteractive();

            const damageButton = this.scene.add
                .text(-100, -110, 'Increase Damage by 10', {
                    font: '20px Arial',
                    fill: '#ffffff',
                    align: 'center'
                })
                .setInteractive();

            const speedButton = this.scene.add
                .text(-100, -90, 'Increase speed by 20', {
                    font: '20px Arial',
                    fill: '#ffffff',
                    align: 'center'
                })
                .setInteractive();

            // Add buttons to the container
            this.upgradeOptions.add(upgradeText);
            this.upgradeOptions.add(healthButton);
            this.upgradeOptions.add(damageButton);
            this.upgradeOptions.add(speedButton);

            // Set button actions
            healthButton.on('pointerdown', () => this.upgradeHealth());
            damageButton.on('pointerdown', () => this.upgradeDamage());
            speedButton.on('pointerdown', () => this.upgradeSpeed());
            const chooseAbilityText = this.scene.add.text(
                330,
                300,
                'Or Choose an Ability:',
                { font: '24px Arial', fill: '#ffffff', align: 'center' }
            );
            chooseAbilityText.setOrigin(0.5, 0.5);

            const abilities = ['Bomb', 'Shield', 'Heal'];
            let startX = -100;
            let startXText = 220;
            abilities.forEach((ability) => {
                const icon = this.scene.add
                    .image(startX, 60, 'card')
                    .setScale(0.8)
                    .setInteractive();
                icon.setOrigin(0.5, 0.5);
                const text = this.scene.add.text(startXText, 340, ability, {
                    font: '16px Arial',
                    fill: '#ffffff',
                    align: 'center'
                });
                text.setOrigin(0.5, 0.5);
                text.setDepth(11); // Ensure text appears above the icon
                icon.setDepth(10); // Keep icon below text
                icon.on('pointerdown', () => this.chooseAbility(ability));
                this.upgradeOptions.add(icon, text);
                startX += 100;
                startXText += 100;
            });
            // Hide upgrade options after selection
            this.upgradeOptions.setDepth(10); // Make sure upgrade options are on top
        }
    }
    chooseAbility(ability) {
        console.log(`Player chose ability: ${ability}`);
        this.player.addAbility(ability);
        this.hideUpgradeOptions();
    }

    upgradeHealth() {
        this.player.maxHealth += 20;
        this.player.health = this.player.maxHealth; // Restore health on upgrade
        this.player.updateHealthBar();
        this.upgradeChosen = true; // Set upgradeChosen to true when an upgrade is selected
        this.hideUpgradeOptions();
    }

    upgradeDamage() {
        this.player.damage += 10;
        this.upgradeChosen = true; // Set upgradeChosen to true when an upgrade is selected
        this.hideUpgradeOptions();
    }

    upgradeSpeed() {
        this.player.speed += 20;
        this.upgradeChosen = true; // Set upgradeChosen to true when an upgrade is selected
        this.hideUpgradeOptions();
    }

    hideUpgradeOptions() {
        if (this.upgradeOptions) {
            this.upgradeOptions.setVisible(false);
            this.upgradeOptions = null;

            // Now proceed to next wave after upgrade options are hidden
            this.scene.time.delayedCall(500, () => {
                // Destroy all enemies and items
                this.scene.enemies.forEach((enemy) => enemy.destroy());
                this.scene.items.forEach((item) => item.destroy());

                // Reset other scene objects
                this.scene.dungeon = [];

                // Restart the scene to load the next wave
                this.scene.scene.restart();
            });
        }
    }
}
