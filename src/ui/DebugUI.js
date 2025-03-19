export class DebugUI {
    constructor(camera, environment, player) {
        this.camera = camera;
        this.environment = environment;
        this.player = player;
        this.isUnlimitedMana = false;
        this.isNoCooldown = false;

        // Load CSS file
        this.loadStyles();

        this.debug = document.createElement('div');
        this.debug.className = 'debug-panel';

        // Create container for debug toggles
        this.togglesContainer = document.createElement('div');
        this.togglesContainer.className = 'toggles-container';

        // Store toggle references
        this.toggles = {
            mana: null,
            cooldown: null
        };

        // Create unlimited mana toggle
        const manaToggleContainer = this.createToggleSwitch(
            'Unlimited Mana',
            (checked) => {
                this.isUnlimitedMana = checked;
                this.handleUnlimitedManaToggle();
            },
            'mana'
        );

        // Create no cooldown toggle
        const cooldownToggleContainer = this.createToggleSwitch(
            'No Cooldown',
            (checked) => {
                this.isNoCooldown = checked;
                this.handleNoCooldownToggle();
            },
            'cooldown'
        );

        // Add toggles to container
        this.togglesContainer.appendChild(manaToggleContainer);
        this.togglesContainer.appendChild(cooldownToggleContainer);

        // Add containers to debug panel
        this.debugInfo = document.createElement('div');
        this.debug.appendChild(this.debugInfo);
        this.debug.appendChild(this.togglesContainer);

        document.body.appendChild(this.debug);

        // Add FPS tracking properties
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;

        // Update FPS every second
        setInterval(() => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }, 1000);
    }

    loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = './src/ui/styles/debug.css';
        document.head.appendChild(link);
    }

    createToggleSwitch(labelText, onChange, toggleKey) {
        const container = document.createElement('div');
        container.className = 'switch-container';

        const label = document.createElement('label');
        label.className = 'switch';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';

        // Store toggle reference
        this.toggles[toggleKey] = toggle;

        const slider = document.createElement('span');
        slider.className = 'slider round';

        const textLabel = document.createElement('span');
        textLabel.textContent = labelText;
        textLabel.className = 'switch-label';

        // Add event listeners
        toggle.addEventListener('change', () => onChange(toggle.checked));

        // Prevent event propagation
        [label, toggle, slider].forEach((element) => {
            element.addEventListener('click', (event) =>
                event.stopPropagation()
            );
            element.addEventListener('mousedown', (event) =>
                event.stopPropagation()
            );
        });

        // Assemble the switch
        label.appendChild(toggle);
        label.appendChild(slider);
        container.appendChild(label);
        container.appendChild(textLabel);

        return container;
    }

    handleUnlimitedManaToggle() {
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

    handleNoCooldownToggle() {
        if (this.player && this.player.champion) {
            // Store original cooldowns
            if (this.isNoCooldown) {
                this.originalCooldowns = {};
                Object.entries(this.player.champion.abilities).forEach(
                    ([key, ability]) => {
                        this.originalCooldowns[key] = ability.cooldown;
                        ability.cooldown = 0;
                    }
                );
            } else {
                // Restore original cooldowns
                if (this.originalCooldowns) {
                    Object.entries(this.player.champion.abilities).forEach(
                        ([key, ability]) => {
                            ability.cooldown = this.originalCooldowns[key];
                        }
                    );
                }
            }
        }

        this.update();
    }

    update() {
        // Increment frame counter
        this.frameCount++;

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
            `FPS: ${this.fps}`,
            `Trees: ${this.environment.trees.length}`,
            `Monsters: ${this.environment.monsters.length}`,
            `Destructibles: ${this.environment.destructibles.length}`,
            `Unlimited Mana: ${this.isUnlimitedMana ? 'ON' : 'OFF'}`,
            `No Cooldown: ${this.isNoCooldown ? 'ON' : 'OFF'}`
        ].join('</br>');
    }

    destroy() {
        if (this.debug && this.debug.parentNode) {
            this.debug.parentNode.removeChild(this.debug);
        }
    }
}
