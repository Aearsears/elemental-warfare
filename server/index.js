const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
const port = process.env.PORT || 8080;

// Game state
const gameState = {
    players: new Map(),
    abilities: []
};

// Create WebSocket server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    const playerId = uuidv4();
    console.log(`Player ${playerId} connected`);

    // Store player connection
    gameState.players.set(playerId, {
        id: playerId,
        ws,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        champion: 'mage',
        lastUpdate: Date.now()
    });

    // Send initial state
    ws.send(
        JSON.stringify({
            type: 'init',
            data: {
                id: playerId,
                players: Array.from(gameState.players.values())
                    .filter((p) => p.id !== playerId)
                    .map((p) => ({
                        id: p.id,
                        position: p.position,
                        rotation: p.rotation,
                        champion: p.champion
                    }))
            }
        })
    );

    // Broadcast new player to others
    broadcast(
        {
            type: 'playerJoined',
            data: {
                id: playerId,
                champion: 'mage'
            }
        },
        playerId
    );

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        handleMessage(playerId, data);
    });

    ws.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        gameState.players.delete(playerId);
        broadcast({
            type: 'playerLeft',
            data: { id: playerId }
        });
    });
});

function handleMessage(playerId, message) {
    const player = gameState.players.get(playerId);
    if (!player) return;

    switch (message.type) {
        case 'playerPosition':
            player.position = message.data.position;
            player.rotation = message.data.rotation;
            player.lastUpdate = Date.now();
            broadcast(
                {
                    type: 'playerPosition',
                    data: {
                        id: playerId,
                        position: player.position,
                        rotation: player.rotation
                    }
                },
                playerId
            );
            break;

        case 'castAbility':
            broadcast(
                {
                    type: 'abilityUsed',
                    data: {
                        playerId,
                        ability: message.data.ability,
                        target: message.data.target
                    }
                },
                playerId
            );
            break;
    }
}

function broadcast(message, excludeId = null) {
    gameState.players.forEach((player, id) => {
        if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

// Lag compensation
setInterval(() => {
    const now = Date.now();
    gameState.players.forEach((player, id) => {
        if (now - player.lastUpdate > 5000) {
            console.log(`Player ${id} timed out`);
            player.ws.close();
            gameState.players.delete(id);
            broadcast({
                type: 'playerLeft',
                data: { id }
            });
        }
    });
}, 1000);
