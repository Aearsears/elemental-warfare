import { WebSocketClient } from './WebSocketClient.js';
import { RemotePlayer } from '../champions/RemotePlayer.js';
import { NETWORK_CONFIG } from './config.js';
import * as THREE from 'three';
export class NetworkManager {
    constructor(scene, localPlayer) {
        this.scene = scene;
        this.localPlayer = localPlayer;
        this.wsClient = new WebSocketClient();
        this.remotePlayers = new Map(); // Stores player ID -> RemotePlayer instance
        this.lastUpdateTime = 0;
        this.localPlayerId = null;

        // Connect and setup handlers immediately
        this.wsClient.connect();
        this.setupMessageHandlers();

        // Set up position update handler
        this.wsClient.setPositionUpdateCallback((data) => {
            const remotePlayer = this.remotePlayers.get(data.id);
            if (remotePlayer) {
                remotePlayer.updatePosition(data.position);
                remotePlayer.updateRotation(data.rotation);
            }
        });
    }

    setupMessageHandlers() {
        // Handle initial connection and existing players
        this.wsClient.registerHandler('init', (data) => {
            this.localPlayerId = data.id;
            console.log('Initializing with ID:', this.localPlayerId);
            // Add all existing players except self
            data.players.forEach((playerData) => {
                if (playerData.id !== this.localPlayerId) {
                    this.addRemotePlayer(playerData);
                }
            });
        });

        this.wsClient.registerHandler('playerJoined', (data) => {
            if (data.id !== this.localPlayerId) {
                this.addRemotePlayer(data);
            }
        });

        this.wsClient.registerHandler('playerLeft', (data) => {
            this.removeRemotePlayer(data.id);
        });

        this.wsClient.registerHandler('playerPosition', (data) => {
            // Only update position for other players
            if (data.id !== this.localPlayerId) {
                const remotePlayer = this.remotePlayers.get(data.id);
                if (remotePlayer) {
                    remotePlayer.updatePosition(data.position);
                    remotePlayer.updateRotation(data.rotation);
                }
            }
        });

        this.wsClient.registerHandler('abilityUsed', (data) => {
            this.handleRemoteAbility(data);
        });
    }

    addRemotePlayer(data) {
        if (this.remotePlayers.has(data.id)) return;

        console.log('Adding remote player:', data.id);
        const remotePlayer = new RemotePlayer(
            data.champion || 'mage',
            this.scene
        );
        this.remotePlayers.set(data.id, remotePlayer);
        this.scene.add(remotePlayer.getMesh());

        // Set initial position if provided
        if (data.position) {
            remotePlayer.updatePosition(data.position);
        }
        if (data.rotation) {
            remotePlayer.updateRotation(data.rotation);
        }
    }

    removeRemotePlayer(playerId) {
        const player = this.remotePlayers.get(playerId);
        if (player) {
            console.log('Removing remote player:', playerId);
            this.scene.remove(player.getMesh());
            this.remotePlayers.delete(playerId);
        }
    }

    updateRemotePlayer(data) {
        const player = this.remotePlayers.get(data.id);
        if (player) {
            console.log('Received position update:', data.position); // Debug log
            player.updatePosition(data.position);
            if (data.rotation) {
                player.updateRotation(
                    new THREE.Euler(
                        data.rotation.x,
                        data.rotation.y,
                        data.rotation.z
                    )
                );
            }
        }
    }

    handleRemoteAbility(data) {
        const player = this.remotePlayers.get(data.playerId);
        if (player) {
            player.castAbility(data.ability, data.target);
        }
    }

    update(delta) {
        // TODO: fix bug not updating other player position
        const now = Date.now();
        // Send position updates every 16ms (60fps)
        if (now - this.lastUpdateTime > 16) {
            const position = this.localPlayer.getPosition();
            const rotation = this.localPlayer.getMesh().rotation;

            // Debug log to verify data
            // console.log('Sending position update:', position);

            this.wsClient.updatePlayerPosition(position, rotation);

            this.lastUpdateTime = now;
        }

        // Update remote players
        this.remotePlayers.forEach((player) => {
            player.update(delta);
        });
    }
}
