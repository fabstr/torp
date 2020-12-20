import { Boilerplate } from "./boilerplate";
import { DrawedObject, DrawedObjectParams } from "./drawedObject";
import { MapLayer } from "./MapLayer";

export enum ItemType {
    None = 0,
    Grass,
    Gravel,
    Flower,
    Figure
}

export class DrawingWindow {
    public x1 = 0;
    public y1 = 0;
    public x2 = 800;
    public y2 = 640;

    public toString: () => string = () => {
        return `x1=${this.x1} y1=${this.y1} x2=${this.x2} y2=${this.y2}`;
    };
}

export class App {
    private bp: Boilerplate;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;

    private mapWidth = 16; // units
    private mapHeight = 16; // units
    private drawingWindow = new DrawingWindow();

    // layers to draw
    private layers: Record<string, MapLayer> = {};
    private ui: DrawedObject[] = [];
    private drawedObjects: Record<string, DrawedObject> = {};

    constructor(shaderSources: Record<string, string>, textureImages: Record<string, HTMLImageElement>, mapData: Record<string, string>) {
        this.bp = new Boilerplate(shaderSources, textureImages);
        this.gl = this.bp.gl;
        this.bp.resize();
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.program = this.bp.createProgram('vertex', 'fragment');
        this.ui.push(...this.getInventoryBar())

        for (let name in mapData) {
            this.layers[name] = MapLayer.fromString(mapData[name], this.bp, this.program);
        }
    }

    private getInventoryBar(): DrawedObject[] {
        const canvasWidth = this.bp.gl.canvas.width;

        const x0 = (canvasWidth - 640) / 2;
        const y = 600 - 16 - 64;

        const inventoryBar: DrawedObject[] = [];

        const params: DrawedObjectParams = {
            uniforms: ['u_matrix', 'u_texture'],
            attribs: ['a_position', 'a_textureCoordinates'],
            geometry: 'square_64_64',
            texture: 'sprites',
            textureWidth: 1 / 4,
            textureHeight: 1 / 4,
            y: y,
        };

        // left
        params.x = x0;
        params.texturePositionX = 0;
        params.texturePositionY = 1 / 4;
        inventoryBar.push(new DrawedObject(this.bp, this.program, params));

        // middle, 8 pcs
        for (let i = 1; i <= 8; i++) {
            params.x = x0 + 64 * i;
            params.texturePositionX = 1 / 4;
            params.texturePositionY = 1 / 4;
            inventoryBar.push(new DrawedObject(this.bp, this.program, params));
        }

        // right
        params.x = x0 + 64 * 9;
        params.texturePositionX = 2 / 4;
        params.texturePositionY = 1 / 4;
        inventoryBar.push(new DrawedObject(this.bp, this.program, params));

        return inventoryBar;
    }

    run() {
        this.bp.resize();
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        const render = (time: number) => {
            this.gl.clearColor(1, 1, 1, 1);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            this.layers['ground'].render(this.drawingWindow);
            this.layers['environment'].render(this.drawingWindow);
            for (let id in this.ui) {
                this.ui[id].render();
            }
            // requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }
}
