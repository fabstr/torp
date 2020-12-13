import { mat3, vec2 } from "gl-matrix";
import { WebGLBoilerplate } from "./webglboilerplate";
import { DrawedObject } from "./drawedObject";

class Renderer {
    bp: WebGLBoilerplate;
    gl: WebGL2RenderingContext;

    objects: Record<string, DrawedObject> = {};

    constructor(bp: WebGLBoilerplate) {
        this.bp = bp;
        this.gl = bp.gl;
        this.bp.resize();
    }

    render() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (let id in this.objects) {
            this.objects[id].render();
        }
    }

    addObject(id: string, object: DrawedObject) {
        this.objects[id] = object;
    }
}

export class App {
    renderer: Renderer;
    bp: WebGLBoilerplate;

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

    constructor(bp: WebGLBoilerplate) {
        this.bp = bp;
        this.renderer = new Renderer(bp);

        const program = this.bp.createProgram('vertex', 'fragment');

        const width = 70;
        const height = 70;

        for (let col = 0; col < 8; col++) {
            for (let row = 0; row < 8; row++) {
                const square = this.getSquareVertices(width, height);
                const x = col * width;
                const y = row * height;
                const id = `square_${col}_${row}`;
                this.renderer.addObject(id, new DrawedObject({
                    bp: this.bp,
                    program: program,
                    uniforms: ['u_matrix', 'u_color'],
                    attribs: ['a_position'],
                    geometry: square,
                    x: x,
                    y: y
                }));

            }
        }
    }

    run() {
        this.renderer.render();
    }
}