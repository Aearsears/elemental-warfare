export class AbilitySelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AbilitySelectionScene' });
        this.selectedAbility = null; // Store the selected ability
    }

    preload() {
        // Preload any assets for the abilities (e.g., icons or images)
        this.load.image('ability_1', 'assets/abilities/ability_1.png');
        this.load.image('ability_2', 'assets/abilities/ability_2.png');
        this.load.image('ability_3', 'assets/abilities/ability_3.png');
    }

    create() {
        // Create a title text
        this.add.text(200, 50, 'Choose an Ability', {
            fontSize: '32px',
            fill: '#fff'
        });

        // Create buttons for abilities
        const ability1 = this.add.image(150, 200, 'ability_1').setInteractive();
        const ability2 = this.add.image(320, 200, 'ability_2').setInteractive();
        const ability3 = this.add.image(490, 200, 'ability_3').setInteractive();

        // Add hover effects for buttons
        ability1.on('pointerover', () => {
            ability1.setAlpha(0.7);
        });
        ability1.on('pointerout', () => {
            ability1.setAlpha(1);
        });
        ability1.on('pointerup', () => {
            this.selectAbility('Ability 1');
        });

        ability2.on('pointerover', () => {
            ability2.setAlpha(0.7);
        });
        ability2.on('pointerout', () => {
            ability2.setAlpha(1);
        });
        ability2.on('pointerup', () => {
            this.selectAbility('Ability 2');
        });

        ability3.on('pointerover', () => {
            ability3.setAlpha(0.7);
        });
        ability3.on('pointerout', () => {
            ability3.setAlpha(1);
        });
        ability3.on('pointerup', () => {
            this.selectAbility('Ability 3');
        });

        // Add a "Continue" button that will proceed to the next level
        const continueButton = this.add
            .text(320, 350, 'Continue', { fontSize: '24px', fill: '#fff' })
            .setInteractive()
            .on('pointerover', () => continueButton.setStyle({ fill: '#ff0' }))
            .on('pointerout', () => continueButton.setStyle({ fill: '#fff' }))
            .on('pointerup', () => this.startNextLevel());

        // Center the continue button
        continueButton.setOrigin(0.5, 0.5);
    }

    // This method is called when an ability is selected
    selectAbility(ability) {
        // console.log(`You selected: ${ability}`);
        this.selectedAbility = ability;
        gameState.selectedAbility = this.selectedAbility; // Store the selected ability globally
    }

    // This method is called to proceed to the next level after selecting an ability
    startNextLevel() {
        if (!this.selectedAbility) {
            // console.log('Please select an ability first!');
            return;
        }

        // Store the selected ability (you can pass it to the next scene or level)
        // console.log(`Starting next level with ${this.selectedAbility}`);

        // Move to the next level (or dungeon scene)
        this.scene.start('DungeonScene');
    }
}
