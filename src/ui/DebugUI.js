export class DebugUI {
    constructor(camera, environment, player) {
        this.camera = camera;
        this.environment = environment;
        this.player = player;
        this.sandboxMode = false;

        this.debug = document.createElement('div');
        this.debug.style.position = 'fixed';
        this.debug.style.top = '10px';
        this.debug.style.left = '10px';
        this.debug.style.color = 'white';
        this.debug.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.debug.style.padding = '10px';
        this.debug.style.fontFamily = 'monospace';
        this.debug.style.cursor = 'pointer';

        // Add sandbox mode toggle button
        this.sandboxButton = document.createElement('button');
        this.sandboxButton.textContent = 'Toggle Sandbox Mode';
        this.sandboxButton.style.marginTop = '10px';
        this.sandboxButton.style.padding = '5px';
        this.sandboxButton.style.backgroundColor = '#444';
        this.sandboxButton.style.color = 'white';
        this.sandboxButton.style.border = '1px solid #666';
        this.sandboxButton.style.cursor = 'pointer';

        // Use the handleSandboxToggle method for click events
        this.sandboxButton.addEventListener('click', () =>
            this.handleSandboxToggle()
        );

        this.debug.appendChild(this.sandboxButton);
        document.body.appendChild(this.debug);
    }

    handleSandboxToggle() {
        this.sandboxMode = !this.sandboxMode;

        // Update button appearance
        this.sandboxButton.style.backgroundColor = this.sandboxMode
            ? '#080'
            : '#444';
        this.sandboxButton.textContent = `Sandbox Mode: ${
            this.sandboxMode ? 'ON' : 'OFF'
        }`;

        // Apply sandbox effects
        if (this.player && this.player.champion) {
            if (this.sandboxMode) {
                // Store original values
                this.originalValues = {
                    mana: this.player.champion.mana,
                    maxMana: this.player.champion.maxMana,
                    manaRegenRate: this.player.champion.manaRegenRate
                };

                // Set infinite mana
                // TOOD: FIX
                this.player.champion.mana = Infinity;
                this.player.champion.maxMana = Infinity;
                this.player.champion.manaRegenRate = Infinity;
            } else {
                // Restore original values
                if (this.originalValues) {
                    this.player.champion.mana = this.originalValues.mana;
                    this.player.champion.maxMana = this.originalValues.maxMana;
                    this.player.champion.manaRegenRate =
                        this.originalValues.manaRegenRate;
                }
            }
        }

        // Force an update of the debug display
        this.update();
    }

    update() {
        // If sandbox mode is on, set mana to max
        if (this.sandboxMode && this.player.champion) {
            this.player.champion.mana = this.player.champion.maxMana;
        }

        const playerPos = this.player.getPosition();
        this.debug.innerHTML = [
            '<strong>Debug Information</strong>',
            '-------------------',
            `Camera: (${this.camera.position.x.toFixed(
                2
            )}, ${this.camera.position.y.toFixed(
                2
            )}, ${this.camera.position.z.toFixed(2)})`,
            `Player: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(
                2
            )}, ${playerPos.z.toFixed(2)})`,
            `FPS: ${Math.round(1000 / 16)}`,
            `Trees: ${this.environment.trees.length}`,
            `Monsters: ${this.environment.jungleCamps.reduce(
                (sum, camp) => sum + camp.monsterInstances.length,
                0
            )}`,
            `Destructibles: ${this.environment.destructibles.length}`,
            `Sandbox Mode: ${this.sandboxMode ? 'ON' : 'OFF'}`
        ].join('</br>');

        // Re-append the button after updating innerHTML
        this.debug.appendChild(this.sandboxButton);
    }

    destroy() {
        if (this.debug && this.debug.parentNode) {
            this.debug.parentNode.removeChild(this.debug);
        }
    }
}
