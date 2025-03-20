export class WebSocketClient {
    constructor() {
        this.ws = null;
        this.players = new Map();
        this.clientId = null;
        this.messageHandlers = new Map();
    }

    connect(serverUrl = 'ws://localhost:8080') {
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
            console.log('Connected to server');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
                handler(message.data);
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connect(serverUrl), 5000);
        };
    }

    registerHandler(messageType, handler) {
        this.messageHandlers.set(messageType, handler);
    }

    send(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, data }));
        }
    }

    updatePlayerPosition(position, rotation) {
        this.send('playerPosition', { position, rotation });
    }

    castAbility(abilityKey, targetPosition) {
        this.send('castAbility', {
            ability: abilityKey,
            target: targetPosition
        });
    }
}
