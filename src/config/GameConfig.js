export const ENEMY_TYPES = {
    SLIME: {
        health: 30,
        damage: 10,
        speed: 1,
        color: 0x00ff00,
        experience: 10
    },
    SKELETON: {
        health: 50,
        damage: 15,
        speed: 1.5,
        color: 0xcccccc,
        experience: 20
    },
    BOSS: {
        health: 200,
        damage: 30,
        speed: 0.7,
        color: 0xff0000,
        experience: 100
    }
};

export const ITEM_TYPES = {
    HEALTH_POTION: {
        color: 0xff0000,
        shape: 'circle',
        effect: (player) => {
            player.heal(50);
            return true;
        }
    },
    SWORD: {
        color: 0xcccccc,
        shape: 'square',
        effect: (player) => {
            player.increaseDamage(10);
            return true;
        }
    },
    KEY: {
        color: 0xffff00,
        shape: 'triangle',
        effect: (player) => {
            player.keys++;
            return true;
        }
    }
};
