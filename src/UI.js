export class UI {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // Create the text UI element to display remaining abilities
        this.abilityText = this.scene.add.text(
            10,
            10,
            'Remaining Abilities: ',
            {
                font: '16px Arial',
                fill: '#ffffff',
                padding: { x: 10, y: 10 }
            }
        );

        // Set the scroll factor to 0 so it stays fixed in the same position as the camera moves
        this.abilityText.setScrollFactor(0);

        // Initially, update the UI to show available abilities
        this.update();
    }

    // Update the UI text with the remaining abilities
    update() {
        const remainingAbilities = this.player.abilityPool
            .map((ability) => ability.name)
            .join(', ');

        this.abilityText.setText(`Remaining Abilities: ${remainingAbilities}`);
    }

    // Optionally, you can hide the ability UI during game over or when no abilities are left
    hide() {
        this.abilityText.setVisible(false);
    }

    // Optionally, you can show the ability UI again
    show() {
        this.abilityText.setVisible(true);
    }
}
