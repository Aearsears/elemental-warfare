export class CombatController {
    constructor(player, environment, scene) {
        this.player = player;
        this.environment = environment;
        this.scene = scene;
    }

    handleAttack(target) {
        this.player.champion.attack();
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

    createHitEffect(position) {
        // Create a simple hit effect
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.5
        });
        const hitEffect = new THREE.Mesh(geometry, material);
        hitEffect.position.copy(position);

        // Add to scene and remove after animation
        this.scene.add(hitEffect);
        setTimeout(() => {
            this.scene.remove(hitEffect);
        }, 200);
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
        return distance <= this.player.champion.attackRange;
    }
}
