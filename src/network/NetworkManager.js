import { WebSocketClient } from './WebSocketClient.js';
import { RemotePlayer } from '../champions/RemotePlayer.js';
import { NETWORK_CONFIG } from './config.js';

export class NetworkManager {
    constructor(scene, localPlayer) {
        this.scene = scene;
        this.localPlayer = localPlayer;
        this.wsClient = new WebSocketClient();
        this.remotePlayers = new Map();
        this.lastUpdateTime = 0;

        // Connect and setup handlers immediately
        this.wsClient.connect();
        this.setupMessageHandlers();
    }

    setupMessageHandlers() {
        // Handle initial connection and existing players
        this.wsClient.registerHandler('init', (data) => {
            // Add all existing players
            data.players.forEach((playerData) => {
                this.addRemotePlayer({
                    id: playerData.id,
                    champion: playerData.champion,
                    position: playerData.position,
                    rotation: playerData.rotation
                });
            });
        });

        this.wsClient.registerHandler('playerJoined', (data) => {
            this.addRemotePlayer(data);
        });

        this.wsClient.registerHandler('playerLeft', (data) => {
            this.removeRemotePlayer(data.id);
        });

        this.wsClient.registerHandler('playerPosition', (data) => {
            this.updateRemotePlayer(data);
        });

        this.wsClient.registerHandler('abilityUsed', (data) => {
            this.handleRemoteAbility(data);
        });
    }

    addRemotePlayer(data) {
        if (this.remotePlayers.has(data.id)) return;

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
            this.scene.remove(player.getMesh());
            this.remotePlayers.delete(playerId);
        }
    }

    updateRemotePlayer(data) {
        const player = this.remotePlayers.get(data.id);
        if (player) {
            player.updatePosition(data.position);
            player.updateRotation(data.rotation);
        }
    }

    handleRemoteAbility(data) {
        const player = this.remotePlayers.get(data.playerId);
        if (player) {
            player.castAbility(data.ability, data.target);
        }
    }

    update(delta) {
        const now = Date.now();
        // Send position updates every 50ms
        if (now - this.lastUpdateTime > 50) {
            const position = this.localPlayer.getPosition();
            const rotation = this.localPlayer.getMesh().rotation;

            this.wsClient.send('playerPosition', {
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                },
                rotation: {
                    x: rotation.x,
                    y: rotation.y,
                    z: rotation.z
                }
            });

            this.lastUpdateTime = now;
        }

        // Update remote players
        this.remotePlayers.forEach((player) => {
            player.update(delta);
        });
    }
}
