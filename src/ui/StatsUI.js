export class StatsUI {
    constructor(player) {
        this.player = player;
        this.container = this.createContainer();
        this.statsElements = {};
        this.initializeUI();
    }

    createContainer() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.padding = '15px';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        container.style.borderRadius = '5px';
        container.style.color = 'white';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.minWidth = '200px';
        document.body.appendChild(container);
        return container;
    }

    initializeUI() {
        // Create stat elements
        const stats = ['health', 'mana', 'level', 'experience'];

        stats.forEach((stat) => {
            const statContainer = document.createElement('div');
            statContainer.style.marginBottom = '5px';

            // Create label
            const label = document.createElement('span');
            label.textContent = `${
                stat.charAt(0).toUpperCase() + stat.slice(1)
            }: `;

            // Create value
            const value = document.createElement('span');
            this.statsElements[stat] = value;

            // Create progress bar for health and mana
            if (stat === 'health' || stat === 'mana') {
                const barContainer = document.createElement('div');
                barContainer.style.width = '100%';
                barContainer.style.height = '10px';
                barContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                barContainer.style.borderRadius = '5px';
                barContainer.style.marginTop = '2px';

                const bar = document.createElement('div');
                bar.style.height = '100%';
                bar.style.borderRadius = '5px';
                bar.style.backgroundColor =
                    stat === 'health' ? '#ff4444' : '#4444ff';
                bar.style.width = '100%';
                bar.style.transition = 'width 0.3s';
                this.statsElements[`${stat}Bar`] = bar;

                barContainer.appendChild(bar);
                statContainer.appendChild(label);
                statContainer.appendChild(value);
                statContainer.appendChild(barContainer);
            } else {
                statContainer.appendChild(label);
                statContainer.appendChild(value);
            }

            this.container.appendChild(statContainer);
        });
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

        // Update level and experience
        this.statsElements.level.textContent = this.player.level;
        this.statsElements.experience.textContent = `${
            this.player.experience
        }/${this.player.level * 100}`;
    }
}
