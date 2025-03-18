import { Champion } from './Champion.js';
import * as THREE from 'three';
import { MultiShot } from '../abilities/archer/MultiShot.js';
import { RainOfArrows } from '../abilities/archer/RainOfArrows.js';
import { EvasiveShot } from '../abilities/archer/EvasiveShot.js';
import { PrecisionStrike } from '../abilities/archer/PrecisionStrike.js';

export class Archer extends Champion {
    constructor(scene) {
        super({
            scene,
            health: 100,
            mana: 80,
            speed: 0.2,
            attackDamage: 12,
            attackRange: 15,
            healthRegenRate: 2, // 2 health per second
            manaRegenRate: 1 // 1 mana per second
        });

        // Initialize abilities
        this.abilities = {
            Q: new MultiShot(),
            W: new RainOfArrows(),
            E: new EvasiveShot(),
            R: new PrecisionStrike()
        };

        // Initialize each ability with scene
        Object.values(this.abilities).forEach((ability) =>
            ability.initialize(scene)
        );

        // Add key listeners
        this.initializeAbilities();
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

    createModel() {
        const archerGroup = new THREE.Group();

        // Body - slender than warrior
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.6);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2e7d32 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1;
        this.body.castShadow = true;
        archerGroup.add(this.body);

        // Cloak
        const cloakGeometry = new THREE.BoxGeometry(1, 1.4, 0.2);
        const cloakMaterial = new THREE.MeshPhongMaterial({ color: 0x1b5e20 });
        const cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
        cloak.position.y = 0.9;
        cloak.position.z = -0.2;
        archerGroup.add(cloak);

        // Bow
        const bowGeometry = new THREE.TorusGeometry(0.5, 0.05, 8, 16, Math.PI);
        const bowMaterial = new THREE.MeshPhongMaterial({ color: 0x795548 });
        this.bow = new THREE.Mesh(bowGeometry, bowMaterial);
        this.bow.position.set(0.6, 1.2, 0);
        this.bow.rotation.y = Math.PI / 2;
        archerGroup.add(this.bow);

        // Quiver
        const quiverGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
        const quiverMaterial = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
        const quiver = new THREE.Mesh(quiverGeometry, quiverMaterial);
        quiver.position.set(-0.3, 1.2, -0.2);
        quiver.rotation.x = Math.PI / 6;
        archerGroup.add(quiver);

        return archerGroup;
    }

    updateAnimation(delta) {
        if (this.isAttacking) {
            // Attack animation
            this.attackAnimationTime += delta;
            // Bow drawing animation
            this.bow.scale.z =
                1 -
                Math.sin(
                    (this.attackAnimationTime / this.attackDuration) * Math.PI
                ) *
                    0.3;

            if (this.attackAnimationTime >= this.attackDuration) {
                this.isAttacking = false;
                this.attackAnimationTime = 0;
                this.bow.scale.z = 1;
            }
        } else if (this.isMoving) {
            // Walking animation
            this.movementTime += delta * 5;
            this.bow.position.y = 1.2 + Math.sin(this.movementTime) * 0.1;
        } else {
            this.resetAnimation();
        }
    }

    attack() {
        this.isAttacking = true;
        this.attackAnimationTime = 0;
    }

    resetAnimation() {
        this.bow.scale.z = 1;
        this.bow.position.y = 1.2;
    }

    update(delta) {
        super.update(delta);
        // Update all abilities
        Object.values(this.abilities).forEach((ability) =>
            ability.update(delta)
        );
    }
}
