import { Boilerplate } from "./boilerplate";
import { Loader } from "./loader";
import { Renderer } from "./Renderer";

export class App {
    private renderer: Renderer;
    private bp: Boilerplate;

    getSquareVertices(width: number, height: number): number[] {
        return [
            0, 0,
            0, height,
            width, height,
            0, 0,
            width, 0,
            width, height
        ];
    }

    constructor(bp: Boilerplate) {
        this.bp = bp;
        this.renderer = new Renderer(bp);

        const program = this.bp.createProgram('vertex', 'fragment');

        const width = 60;
        const height = 60;
        const square = this.getSquareVertices(width, height);

        for (let x = 0; x < 12; x++) {
            for (let y = 0; y < 9; y++) {
                const id = `square_${x}_${y}`;

                this.renderer.addObject(id, {
                    bp: this.bp,
                    program: program,
                    uniforms: ['u_matrix', 'u_texture'],
                    attribs: ['a_position', 'a_textureCoordinates'],
                    geometry: square,
                    texture: 'f-texture',
                    x: x * width * 1.1,
                    y: y * height * 1.1
                });
            }
        }
    }

    run() {
        this.renderer.render();
    }

    static start() {
        const shaderURLs = {
            'fragment': 'resources/shaders/fragment.frag',
            'vertex': 'resources/shaders/vertex.vert'
        };
        const textureURLs = {
            'f-texture': 'resources/f-texture.png'
        }
        Loader.load(shaderURLs, textureURLs).then(resources => {
            const bp = new Boilerplate(resources.shaderSources, resources.textures);
            const app = new App(bp);
            app.run();
        });
    }

}