import { Boilerplate } from "./boilerplate";
import { Renderer } from "./Renderer";

export class App {
    renderer: Renderer;
    bp: Boilerplate;

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

        const texture = this.bp.createTexture('f-texture');
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
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
}