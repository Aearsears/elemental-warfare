import { Champion } from './Champion.js';
import * as THREE from 'three';
import { WhirlwindSlash } from '../abilities/warrior/WhirlwindSlash.js';
import { BattleShout } from '../abilities/warrior/BattleShout.js';
import { ShieldBlock } from '../abilities/warrior/ShieldBlock.js';
import { BerserkerRage } from '../abilities/warrior/BerserkerRage.js';

export class Warrior extends Champion {
    constructor() {
        super({
            health: 150,
            mana: 50,
            speed: 0.15,
            attackDamage: 15,
            attackRange: 10
        });
        this.isAttacking = false;
        this.attackAnimationTime = 0;
        this.attackDuration = 0.5; // seconds

        // Initialize abilities
        this.abilities = {
            Q: new WhirlwindSlash(),
            W: new BattleShout(),
            E: new ShieldBlock(),
            R: new BerserkerRage()
        };

        // Add key listeners
        this.initializeAbilities();
    }

    createModel() {
        const warriorGroup = new THREE.Group();

        // Body - bulkier than base model
        const bodyGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.9);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1;
        this.body.castShadow = true;
        warriorGroup.add(this.body);

        // Armor plates
        const armorGeometry = new THREE.BoxGeometry(1.4, 0.4, 1);
        const armorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const chestArmor = new THREE.Mesh(armorGeometry, armorMaterial);
        chestArmor.position.y = 1.2;
        warriorGroup.add(chestArmor);

        // Sword
        const swordGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const swordMaterial = new THREE.MeshPhongMaterial({ color: 0xc0c0c0 });
        this.sword = new THREE.Mesh(swordGeometry, swordMaterial);
        this.sword.position.set(0.8, 1.5, 0);
        warriorGroup.add(this.sword);

        return warriorGroup;
    }

    updateAnimation(delta) {
        if (this.isAttacking) {
            // Attack animation
            this.attackAnimationTime += delta;
            // Full 360-degree swing
            this.sword.rotation.z =
                Math.PI * 2 * (this.attackAnimationTime / this.attackDuration);

            if (this.attackAnimationTime >= this.attackDuration) {
                this.isAttacking = false;
                this.attackAnimationTime = 0;
                this.sword.rotation.z = 0;
            }
        } else if (this.isMoving) {
            // Walking animation
            this.movementTime += delta * 5;
            this.sword.rotation.z = Math.sin(this.movementTime) * 0.3;
        } else {
            this.resetAnimation();
        }
    }

    attack() {
        this.isAttacking = true;
        this.attackAnimationTime = 0;
    }

    resetAnimation() {
        this.sword.rotation.z = 0;
    }

    initializeAbilities() {
        document.addEventListener('keydown', (event) => {
            switch (event.key.toUpperCase()) {
                case 'Q':
                    this.useAbility('Q');
                    break;
                case 'W':
                    this.useAbility('W');
                    break;
                case 'E':
                    this.useAbility('E');
                    break;
                case 'R':
                    this.useAbility('R');
                    break;
            }
        });
    }

    useAbility(key) {
        if (this.abilities[key].use(this)) {
            // Trigger ability specific animation
            this.triggerAbilityAnimation(key);
        }
    }

    update(delta) {
        super.update(delta);
        // Update all abilities
        Object.values(this.abilities).forEach((ability) =>
            ability.update(delta)
        );
    }
}
