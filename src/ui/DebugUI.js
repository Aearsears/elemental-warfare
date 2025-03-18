export class DebugUI {
    constructor(camera, environment) {
        this.camera = camera;
        this.environment = environment;

        this.debug = document.createElement('div');
        this.debug.style.position = 'fixed';
        this.debug.style.top = '10px';
        this.debug.style.left = '10px';
        this.debug.style.color = 'white';
        this.debug.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.debug.style.padding = '10px';
        document.body.appendChild(this.debug);
    }

    update() {
        this.debug.textContent = `
            Camera: ${this.camera.position.x.toFixed(
                2
            )}, ${this.camera.position.y.toFixed(
            2
        )}, ${this.camera.position.z.toFixed(2)}
            FPS: ${Math.round(1000 / 16)}
            Trees: ${this.environment.trees.length}
        `;
    }

    destroy() {
        if (this.debug && this.debug.parentNode) {
            this.debug.parentNode.removeChild(this.debug);
        }
    }
}
