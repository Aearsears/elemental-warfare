export class CombatController {
    constructor(player, environment, scene) {
        this.player = player;
        this.environment = environment;
        this.scene = scene;
    }

    handleAttack(target) {
        if (target.userData.type === 'monster') {
            this.handleMonsterAttack(target);
        } else if (target.userData.isDestructible) {
            this.handleDestructibleAttack(target);
        }
    }

    handleMonsterAttack(target) {
        const monster = target.userData.parent;
        if (monster.isAlive) {
            monster.takeDamage(this.player.attackDamage);
        }
    }

    handleDestructibleAttack(target) {
        const destructibleGroup = target.userData.parentGroup;
        if (destructibleGroup?.userData.health > 0) {
            this.applyDamage(destructibleGroup, target);
        }
    }

    applyDamage(destructibleGroup, target) {
        // TODO: FIX ATTACKING AND WHERE TO HANDLE ATTCK
        destructibleGroup.userData.health -= this.player.attackDamage;
        this.showDamageEffect(target);

        if (destructibleGroup.userData.health <= 0) {
            this.destroyObject(destructibleGroup);
        }
    }

    showDamageEffect(target) {
        target.material.emissive.setHex(0xff0000);
        setTimeout(() => {
            target.material.emissive.setHex(0x000000);
        }, 100);
    }

    destroyObject(destructibleGroup) {
        this.createDestructionEffect(destructibleGroup.position);
        this.scene.remove(destructibleGroup);
        this.environment.destructibles = this.environment.destructibles.filter(
            (d) => d !== destructibleGroup
        );
    }

    isTargetInRange(targetPosition) {
        const playerPos = this.player.getPosition();
        const distance = Math.sqrt(
            Math.pow(playerPos.x - targetPosition.x, 2) +
                Math.pow(playerPos.z - targetPosition.z, 2)
        );
        return distance <= this.player.attackRange;
    }
}
