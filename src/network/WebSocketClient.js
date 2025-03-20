export class WebSocketClient {
    constructor() {
        this.ws = null;
        this.messageHandlers = new Map();
        this.isConnected = false;
        this.playerId = null; // Add player ID storage
        this.onPlayerPositionUpdate = null; // Callback for position updates
    }

    connect(serverUrl = 'ws://localhost:8080') {
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.isConnected = true;
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'init') {
                    this.playerId = message.data.id; // Store player ID on init
                    console.log('Player ID assigned:', this.playerId);
                } else if (
                    message.type === 'playerPosition' &&
                    message.data.id !== this.playerId
                ) {
                    // Handle position updates for other players
                    if (this.onPlayerPositionUpdate) {
                        this.onPlayerPositionUpdate(message.data);
                    }
                }
                const handler = this.messageHandlers.get(message.type);
                if (handler) {
                    handler(message.data);
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            // Attempt to reconnect after 2 seconds
            setTimeout(() => this.connect(serverUrl), 2000);
        };
    }

    send(type, data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            try {
                const message = JSON.stringify({ type, data });
                // console.log('Sending message:', message); // Debug log
                this.ws.send(message);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.warn('WebSocket not ready, message not sent:', {
                type,
                data
            });
        }
    }

    registerHandler(messageType, handler) {
        this.messageHandlers.set(messageType, handler);
    }

    updatePlayerPosition(position, rotation) {
        if (!this.playerId) {
            console.warn('No player ID assigned yet');
            return;
        }

        this.send('playerPosition', {
            id: this.playerId,
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
    }

    castAbility(abilityKey, targetPosition) {
        this.send('castAbility', {
            ability: abilityKey,
            target: targetPosition
        });
    }

    setPositionUpdateCallback(callback) {
        this.onPlayerPositionUpdate = callback;
    }
}
