export class Ability {
    constructor(name, action, cooldown) {
        this.name = name; // The name of the ability (e.g., "Dash", "Heal")
        this.action = action; // The function that will execute the ability's logic
        this.cooldown = cooldown; // The cooldown duration in ms
        this.lastUsed = 0; // The time when the ability was last used
    }

    // Check if the ability is off cooldown
    isAvailable(currentTime) {
        return currentTime - this.lastUsed >= this.cooldown;
    }

    // Update the last used time and trigger the action if available
    use(currentTime) {
        if (this.isAvailable(currentTime)) {
            this.action(); // Trigger the ability's action
            this.lastUsed = currentTime; // Update last used time
        } else {
            console.log(`${this.name} is on cooldown!`);
        }
    }
}

export class HealAbility extends Ability {
    constructor(player) {
        super('Heal', () => player.heal(), 2000); // Heal cooldown is 2000ms
    }
}

export class AttackAbility extends Ability {
    constructor(player) {
        super('Attack', () => player.attack(), 1000); // Attack cooldown is 1000ms
    }
}

export class ShieldAbility extends Ability {
    constructor(player) {
        super('Shield', () => player.shield(), 5000); // Shield cooldown is 5000ms
    }
}
