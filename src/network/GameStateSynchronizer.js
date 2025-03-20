export class GameStateSynchronizer {
    constructor(networkManager) {
        this.networkManager = networkManager;
        this.lastStateUpdate = 0;
        this.stateBuffer = [];
        this.reconciliationQueue = [];
    }

    update(delta) {
        const now = Date.now();

        // Send state updates at fixed rate
        if (now - this.lastStateUpdate > NETWORK_CONFIG.POSITION_UPDATE_RATE) {
            this.sendStateUpdate();
            this.lastStateUpdate = now;
        }

        // Process state reconciliation
        this.processReconciliation();
    }

    sendStateUpdate() {
        const state = this.buildGameState();
        this.networkManager.wsClient.send('gameState', state);
        this.stateBuffer.push({
            state,
            timestamp: Date.now()
        });
    }

    buildGameState() {
        const player = this.networkManager.localPlayer;
        return {
            position: player.getPosition(),
            rotation: player.getMesh().rotation,
            abilities: player.getAbilityStates(),
            timestamp: Date.now()
        };
    }

    processReconciliation() {
        while (this.reconciliationQueue.length > 0) {
            const serverState = this.reconciliationQueue.shift();
            this.reconcileState(serverState);
        }
    }

    reconcileState(serverState) {
        // Find matching client state
        const clientState = this.stateBuffer.find(
            (s) => s.timestamp === serverState.timestamp
        );
        if (!clientState) return;

        // Check for significant differences
        const posDiff = new THREE.Vector3()
            .subVectors(serverState.position, clientState.state.position)
            .length();

        if (posDiff > 0.1) {
            // Server correction needed
            this.networkManager.localPlayer.correctPosition(
                serverState.position
            );
        }
    }
}
