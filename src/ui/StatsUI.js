export class StatsUI {
    constructor(player) {
        this.player = player;
        this.loadStyles();
        this.container = this.createContainer();
        this.statsElements = {};
        this.initializeUI();
    }

    loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = './src/ui/styles/stats.css';
        document.head.appendChild(link);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'stats-container';
        document.body.appendChild(container);
        return container;
    }

    initializeUI() {
        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-group';

        // Create stat elements
        const stats = ['health', 'mana', 'level', 'experience'];

        stats.forEach((stat) => {
            const statContainer = document.createElement('div');
            statContainer.className = 'stat-item';

            const label = document.createElement('span');
            label.textContent = `${
                stat.charAt(0).toUpperCase() + stat.slice(1)
            }: `;

            const value = document.createElement('span');
            this.statsElements[stat] = value;

            // Add experience to bars that need progress
            if (stat === 'health' || stat === 'mana' || stat === 'experience') {
                const barContainer = document.createElement('div');
                barContainer.className = 'bar-container';

                const bar = document.createElement('div');
                bar.className = `${stat}-bar`;
                this.statsElements[`${stat}Bar`] = bar;

                barContainer.appendChild(bar);
                statContainer.appendChild(label);
                statContainer.appendChild(value);
                statContainer.appendChild(barContainer);
            } else {
                statContainer.appendChild(label);
                statContainer.appendChild(value);
            }

            statsContainer.appendChild(statContainer);
        });

        // Create abilities container
        const abilitiesContainer = document.createElement('div');
        abilitiesContainer.className = 'abilities-container';

        // Initialize ability slots
        ['Q', 'W', 'E', 'R'].forEach((key) => {
            const abilitySlot = document.createElement('div');
            abilitySlot.className = 'ability-slot';

            const keyBind = document.createElement('div');
            keyBind.className = 'key-bind';
            keyBind.textContent = key;

            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'cooldown-overlay';

            // Add error message container
            const errorMessage = document.createElement('div');
            errorMessage.className = 'ability-error';

            abilitySlot.appendChild(keyBind);
            abilitySlot.appendChild(cooldownOverlay);
            abilitySlot.appendChild(errorMessage);
            abilitiesContainer.appendChild(abilitySlot);

            this.statsElements[`ability${key}`] = abilitySlot;
            this.statsElements[`cooldown${key}`] = cooldownOverlay;
            this.statsElements[`error${key}`] = errorMessage;
        });

        this.container.appendChild(statsContainer);
        this.container.appendChild(abilitiesContainer);
    }

    showAbilityError(key, message) {
        const errorElement = this.statsElements[`error${key}`];
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');

            // Hide the message after 1.5 seconds
            setTimeout(() => {
                errorElement.classList.remove('show');
            }, 1500);
        }
    }

    update() {
        const champion = this.player.champion;
        if (!champion) return;

        // Update health - show as whole number
        const health = `${Math.floor(champion.health)}`;
        this.statsElements.health.textContent = health;
        this.statsElements.healthBar.style.width = `${
            (champion.health / champion.maxHealth) * 100
        }%`;

        // Update mana - show as whole number
        const mana = `${Math.floor(champion.mana)}`;
        this.statsElements.mana.textContent = mana;
        this.statsElements.manaBar.style.width = `${
            (champion.mana / champion.maxMana) * 100
        }%`;

        // Update level and experience with progress bar
        this.statsElements.level.textContent = this.player.level;
        const expForNextLevel = this.player.level * 100;
        const expPercentage = (this.player.experience / expForNextLevel) * 100;

        this.statsElements.experience.textContent = `${this.player.experience}/${expForNextLevel}`;
        this.statsElements.experienceBar.style.width = `${expPercentage}%`;

        // Update ability cooldowns and mana requirements
        if (this.player.champion) {
            Object.entries(this.player.champion.abilities).forEach(
                ([key, ability]) => {
                    const cooldownOverlay =
                        this.statsElements[`cooldown${key}`];
                    const currentTime = Date.now();
                    const timeSinceUsed =
                        (currentTime - ability.lastUsed) / 1000;

                    // Check for ability usage errors
                    if (
                        ability.lastAttempted &&
                        currentTime - ability.lastAttempted < 1000
                    ) {
                        if (timeSinceUsed < ability.cooldown) {
                            this.showAbilityError(key, 'On Cooldown');
                        } else if (champion.mana < ability.manaCost) {
                            this.showAbilityError(key, 'Not Enough Mana');
                        }
                    }

                    // Update cooldown display
                    if (ability.lastUsed && timeSinceUsed < ability.cooldown) {
                        cooldownOverlay.style.display = 'flex';
                        cooldownOverlay.textContent = Math.ceil(
                            ability.cooldown - timeSinceUsed
                        );
                    } else {
                        cooldownOverlay.style.display = 'none';
                        cooldownOverlay.textContent = '';
                    }
                }
            );
        }
    }
}
