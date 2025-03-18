import { Champion } from './Champion.js';
import * as THREE from 'three';
import { Fireball } from '../abilities/mage/Fireball.js';
import { IceBarrier } from '../abilities/mage/IceBarrier.js';
import { ArcaneBlast } from '../abilities/mage/ArcaneBlast.js';
import { Meteor } from '../abilities/mage/Meteor.js';

export class Mage extends Champion {
    constructor(scene) {
        super({
            scene,
            health: 80,
            mana: 120,
            speed: 0.12,
            attackDamage: 8,
            attackRange: 12,
            healthRegenRate: 1.5, // 1.5 health per second
            manaRegenRate: 2 // 2 mana per second
        });

        // Initialize abilities
        this.abilities = {
            Q: new Fireball(),
            W: new IceBarrier(),
            E: new ArcaneBlast(),
            R: new Meteor()
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
        const mageGroup = new THREE.Group();

        // Body - robed figure
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.8, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4a148c });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 1;
        this.body.castShadow = true;
        mageGroup.add(this.body);

        // Staff
        const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const staffMaterial = new THREE.MeshPhongMaterial({ color: 0x4a342a });
        this.staff = new THREE.Mesh(staffGeometry, staffMaterial);
        this.staff.position.set(0.4, 1.2, 0);
        this.staff.rotation.z = Math.PI / 12;
        mageGroup.add(this.staff);

        // Staff orb
        const orbGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const orbMaterial = new THREE.MeshPhongMaterial({
            color: 0x7b1fa2,
            emissive: 0x7b1fa2,
            emissiveIntensity: 0.5
        });
        this.orb = new THREE.Mesh(orbGeometry, orbMaterial);
        this.orb.position.set(0.4, 2.1, 0);
        mageGroup.add(this.orb);

        // Hood
        const hoodGeometry = new THREE.ConeGeometry(0.4, 0.6, 8);
        const hoodMaterial = new THREE.MeshPhongMaterial({ color: 0x311b92 });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.y = 2;
        mageGroup.add(hood);

        return mageGroup;
    }

    updateAnimation(delta) {
        if (this.isAttacking) {
            // Attack animation
            this.attackAnimationTime += delta;
            // Staff casting animation
            this.staff.rotation.z =
                Math.PI / 12 +
                Math.sin(
                    (this.attackAnimationTime / this.attackDuration) * Math.PI
                ) *
                    0.5;
            this.orb.material.emissiveIntensity =
                0.5 +
                Math.sin(
                    (this.attackAnimationTime / this.attackDuration) * Math.PI
                ) *
                    2;

            if (this.attackAnimationTime >= this.attackDuration) {
                this.isAttacking = false;
                this.attackAnimationTime = 0;
                this.resetAnimation();
            }
        } else if (this.isMoving) {
            // Walking animation
            this.movementTime += delta * 5;
            this.staff.rotation.z =
                Math.PI / 12 + Math.sin(this.movementTime) * 0.1;
            this.orb.material.emissiveIntensity =
                0.5 + Math.sin(this.movementTime * 2) * 0.2;
        } else {
            this.resetAnimation();
        }
    }

    resetAnimation() {
        this.staff.rotation.z = Math.PI / 12;
        this.orb.material.emissiveIntensity = 0.5;
    }

    attack() {
        this.isAttacking = true;
        this.attackAnimationTime = 0;
    }

    update(delta) {
        super.update(delta);
        // Update all abilities
        Object.values(this.abilities).forEach((ability) =>
            ability.update(delta)
        );
    }
}
