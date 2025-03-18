export class DebugUI {
    constructor(camera, environment, player) {
        this.camera = camera;
        this.environment = environment;
        this.player = player;
        this.isUnlimitedMana = false; // Renamed from unlimitedMana to avoid conflict

        this.debug = document.createElement('div');
        this.debug.style.position = 'fixed';
        this.debug.style.top = '10px';
        this.debug.style.left = '10px';
        this.debug.style.color = 'white';
        this.debug.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.debug.style.padding = '10px';
        this.debug.style.fontFamily = 'monospace';
        this.debug.style.cursor = 'pointer';

        // Stop click propagation on the debug panel
        this.debug.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });

        // Create switch container
        this.switchContainer = document.createElement('div');
        this.switchContainer.style.display = 'flex';
        this.switchContainer.style.alignItems = 'center';
        this.switchContainer.style.marginTop = '10px';

        // Create switch label
        const label = document.createElement('label');
        label.className = 'switch';
        label.style.marginRight = '10px';

        // Create checkbox input
        this.unlimitedManaToggle = document.createElement('input');
        this.unlimitedManaToggle.type = 'checkbox';
        this.unlimitedManaToggle.style.opacity = '0';
        this.unlimitedManaToggle.style.width = '0';
        this.unlimitedManaToggle.style.height = '0';

        // Create slider
        const slider = document.createElement('span');
        slider.className = 'slider round';

        // Add text label
        const textLabel = document.createElement('span');
        textLabel.textContent = 'Unlimited Mana';
        textLabel.style.color = 'white';
        textLabel.style.marginLeft = '10px';

        // Add event listener
        this.unlimitedManaToggle.addEventListener('change', () => {
            this.handleUnlimitedManaToggle();
            slider.style.backgroundColor = this.isUnlimitedMana
                ? '#080'
                : '#444';
        });

        // Prevent event propagation
        label.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });

        // Assemble the switch
        label.appendChild(this.unlimitedManaToggle);
        label.appendChild(slider);
        this.switchContainer.appendChild(label);
        this.switchContainer.appendChild(textLabel);
        this.debug.appendChild(this.switchContainer);

        document.body.appendChild(this.debug);

        // Add CSS styles for the switch
        const style = document.createElement('style');
        style.textContent = `
            .switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 34px;
            }

            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #444;
                transition: .4s;
                border-radius: 34px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }

            input:checked + .slider {
                background-color: #080;
            }

            input:checked + .slider:before {
                transform: translateX(26px);
            }
        `;
        document.head.appendChild(style);

        // Remove inline styles from slider
        slider.removeAttribute('style');

        // Remove inline styles from label except marginRight
        label.style = '';
        label.style.marginRight = '10px';
    }

    handleUnlimitedManaToggle() {
        this.isUnlimitedMana = this.unlimitedManaToggle.checked;

        if (this.player && this.player.champion) {
            if (this.isUnlimitedMana) {
                // Store original values
                this.originalValues = {
                    mana: this.player.champion.mana,
                    maxMana: this.player.champion.maxMana,
                    manaRegenRate: this.player.champion.manaRegenRate
                };

                // Set unlimited mana
                this.player.champion.mana = 999999;
                this.player.champion.maxMana = 999999;
                this.player.champion.manaRegenRate = 999999;
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

        this.update();
    }

    update() {
        // If unlimited mana is on, keep mana at max
        if (this.isUnlimitedMana && this.player.champion) {
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
            `Unlimited Mana: ${this.isUnlimitedMana ? 'ON' : 'OFF'}`
        ].join('</br>');

        // Re-append the button after updating innerHTML
        this.debug.appendChild(this.switchContainer);
    }

    destroy() {
        if (this.debug && this.debug.parentNode) {
            this.debug.parentNode.removeChild(this.debug);
        }
    }
}
