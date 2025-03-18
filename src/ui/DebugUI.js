export class DebugUI {
    constructor(camera, environment, player) {
        this.camera = camera;
        this.environment = environment;
        this.player = player;

        this.debug = document.createElement('div');
        this.debug.style.position = 'fixed';
        this.debug.style.top = '10px';
        this.debug.style.left = '10px';
        this.debug.style.color = 'white';
        this.debug.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.debug.style.padding = '10px';
        this.debug.style.fontFamily = 'monospace';
        document.body.appendChild(this.debug);
    }

    update() {
        const playerPos = this.player.getPosition();
        this.debug.innerHTML = [
            '<strong>Debug Information</strong>',
            '-------------------',
            `Camera: (${this.camera.position.x.toFixed(
                2
            )}, ${this.camera.position.y.toFixed(
                2
            )}, ${this.camera.position.z.toFixed(2)})`,
            `Player: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(
                2
            )}, ${playerPos.z.toFixed(2)})`,
            `FPS: ${Math.round(1000 / 16)}`,
            `Trees: ${this.environment.trees.length}`,
            `Monsters: ${this.environment.jungleCamps.reduce(
                (sum, camp) => sum + camp.monsterInstances.length,
                0
            )}`,
            `Destructibles: ${this.environment.destructibles.length}`
        ].join('\n');
    }

    destroy() {
        if (this.debug && this.debug.parentNode) {
            this.debug.parentNode.removeChild(this.debug);
        }
    }
}
