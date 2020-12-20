import { Matrix, matrix, } from "mathjs";
import { Boilerplate } from "./boilerplate";
import { DrawedObject, DrawedObjectParams } from "./drawedObject";
import { Loader } from "./loader";
import { Renderer } from "./Renderer";

enum ItemType {
    None = 0,
    Grass,
    Gravel,
    Flower,
    Figure
}

export class App {
    private renderer: Renderer;
    private bp: Boilerplate;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;

    private mapWidth = 512; // units
    private mapHeight = 512; // units
    private drawingWindow: Record<string, number> = {
        x1: 0,
        y1: 0,
        x2: 800,
        y2: 640
    }

    // layers to draw
    private layers: Record<string, math.Matrix> = {
        'ground': matrix('sparse'),
        'environment': matrix('sparse'),
    };
    private ui: DrawedObject[] = [];
    private drawedObjects: Record<string, DrawedObject> = {};

    constructor(bp: Boilerplate) {
        this.bp = bp;
        this.gl = this.bp.gl;
        this.renderer = new Renderer(bp);

        this.program = this.bp.createProgram('vertex', 'fragment');
        this.ui.push(...this.getInventoryBar())

        this.drawedObjects['grass'] = new DrawedObject({
            bp: this.bp,
            program: this.program,
            uniforms: ['u_matrix', 'u_texture'],
            attribs: ['a_position', 'a_textureCoordinates'],
            geometry: this.getSquareVertices(64, 64),
            texture: 'sprites',
            x: 0,
            y: 0,
            texturePositionX: 0,
            texturePositionY: 0,
            textureWidth: 1 / 4,
            textureHeight: 1 / 4
        });

        this.drawedObjects['gravel'] = new DrawedObject({
            bp: this.bp,
            program: this.program,
            uniforms: ['u_matrix', 'u_texture'],
            attribs: ['a_position', 'a_textureCoordinates'],
            geometry: this.getSquareVertices(64, 64),
            texture: 'sprites',
            x: 0,
            y: 0,
            texturePositionX: 1 / 4,
            texturePositionY: 0,
            textureWidth: 1 / 4,
            textureHeight: 1 / 4
        });

        this.drawedObjects['flower'] = new DrawedObject({
            bp: this.bp,
            program: this.program,
            uniforms: ['u_matrix', 'u_texture'],
            attribs: ['a_position', 'a_textureCoordinates'],
            geometry: this.getSquareVertices(64, 64),
            texture: 'sprites',
            x: 0,
            y: 0,
            texturePositionX: 2 / 4,
            texturePositionY: 0,
            textureWidth: 1 / 4,
            textureHeight: 1 / 4
        });

        for (let row = 0; row < this.mapWidth; row++) {
            for (let col = 0; col < this.mapHeight; col++) {
                let item = ItemType.Grass;
                if (Math.random() > 0.8) {
                    item = ItemType.Gravel;
                }
                this.layers['ground'].set([col, row], item);
            }
        }

        for (let row = 0; row < this.mapWidth; row++) {
            for (let col = 0; col < this.mapHeight; col++) {
                if (Math.random() > 0.9) {
                    this.layers['environment'].set([col, row], ItemType.Flower);
                }
            }
        }

    }

    private getSquareVertices(width: number, height: number): number[] {
        return [
            0, 0,
            0, height,
            width, height,
            0, 0,
            width, 0,
            width, height
        ];
    }

    private getInventoryBar(): DrawedObject[] {
        const canvasWidth = this.bp.gl.canvas.width;
        const square = this.getSquareVertices(64, 64);

        const x0 = (canvasWidth - 640) / 2;
        const y = 600 - 16 - 64;

        const inventoryBar: DrawedObject[] = [];

        const params: DrawedObjectParams = {
            bp: this.bp,
            program: this.program,
            uniforms: ['u_matrix', 'u_texture'],
            attribs: ['a_position', 'a_textureCoordinates'],
            geometry: square,
            texture: 'sprites',
            textureWidth: 1 / 4,
            textureHeight: 1 / 4,
            y: y,
        };

        // left
        params.x = x0;
        params.texturePositionX = 0;
        params.texturePositionY = 1 / 4;
        inventoryBar.push(new DrawedObject(params));

        // middle, 8 pcs
        for (let i = 1; i <= 8; i++) {
            params.x = x0 + 64 * i;
            params.texturePositionX = 1 / 4;
            params.texturePositionY = 1 / 4;
            inventoryBar.push(new DrawedObject(params));
        }

        // right
        params.x = x0 + 64 * 9;
        params.texturePositionX = 2 / 4;
        params.texturePositionY = 1 / 4;
        inventoryBar.push(new DrawedObject(params));

        return inventoryBar;
    }

    run() {
        const render = (time: number) => {
            this.actualRender(time);
            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }

    private actualRender(time: number) {
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.layers['ground'].forEach((value, index, matrix) => this.renderLayerItem(value, index, matrix), true);
        this.layers['environment'].forEach((value, index, matrix) => this.renderLayerItem(value, index, matrix), true);
        for (let id in this.ui) {
            this.ui[id].render();
        }
    }

    private renderLayerItem(value: ItemType, indexObject: any, matrix: Matrix) {
        const index = <Array<number>>(<unknown>indexObject);
        const x = index[0];
        const y = index[1];
        let item: DrawedObject | undefined = undefined;

        if (x * 64 < this.drawingWindow.x1 || y * 64 < this.drawingWindow.y1 ||
            x * 64 > this.drawingWindow.x2 || y * 64 > this.drawingWindow.y2) {
            return;
        }

        if (value === ItemType.Gravel) {
            item = this.drawedObjects['gravel'];
        } else if (value === ItemType.Grass) {
            item = this.drawedObjects['grass'];
        } else if (value === ItemType.Flower) {
            item = this.drawedObjects['flower'];
        }

        if (item !== undefined) {
            item.setPosition(x * 64, y * 64);
            item.render();
        }
    }

    static start() {
        const shaderURLs = {
            'fragment': 'resources/shaders/fragment.frag',
            'vertex': 'resources/shaders/vertex.vert'
        };
        const textureURLs = {
            'sprites': 'resources/textures/sprites.png',
        };
        const mapURLs = {
            'ground': 'resources/map/ground.json',
            'environment': 'resources/map/environment.json',
        };
        Loader.load(shaderURLs, textureURLs, mapURLs).then(resources => {
            const bp = new Boilerplate(resources.shaderSources, resources.textures);
            const app = new App(bp);
            app.run();
        });
    }
}
