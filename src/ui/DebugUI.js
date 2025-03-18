export class DebugUI {
    constructor(camera, environment, player) {
        this.camera = camera;
        this.environment = environment;
        this.player = player;
        this.isUnlimitedMana = false;

        // Load CSS file
        this.loadStyles();

        this.debug = document.createElement('div');
        this.debug.className = 'debug-panel';

        // Create switch container
        this.switchContainer = document.createElement('div');
        this.switchContainer.className = 'switch-container';

        // Create switch label
        const label = document.createElement('label');
        label.className = 'switch';

        // Create checkbox input
        this.unlimitedManaToggle = document.createElement('input');
        this.unlimitedManaToggle.type = 'checkbox';

        // Create slider
        const slider = document.createElement('span');
        slider.className = 'slider round';

        // Add text label
        const textLabel = document.createElement('span');
        textLabel.textContent = 'Unlimited Mana';
        textLabel.className = 'switch-label';

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

        this.unlimitedManaToggle.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        label.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        slider.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        // Assemble the switch
        label.appendChild(this.unlimitedManaToggle);
        label.appendChild(slider);
        this.switchContainer.appendChild(label);
        this.switchContainer.appendChild(textLabel);

        // Create debug info container separately
        this.debugInfo = document.createElement('div');
        this.debug.appendChild(this.debugInfo);
        this.debug.appendChild(this.switchContainer);

        document.body.appendChild(this.debug);
    }

    loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = './src/ui/styles/debug.css';
        document.head.appendChild(link);
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

        // Update only the debug info content
        const playerPos = this.player.getPosition();
        this.debugInfo.innerHTML = [
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
    }

    destroy() {
        if (this.debug && this.debug.parentNode) {
            this.debug.parentNode.removeChild(this.debug);
        }
    }
}
