import { Boilerplate } from "./boilerplate";
import { DrawedObject, DrawedObjectParams } from "./drawedObject";

export class Renderer {
    bp: Boilerplate;
    gl: WebGL2RenderingContext;

    objects: Record<string, DrawedObject> = {};

    constructor(bp: Boilerplate) {
        this.bp = bp;
        this.gl = bp.gl;
        this.bp.resize();
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    render() {
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (let id in this.objects) {
            this.objects[id].render();
        }
    }

    addObject(id: string, objectParams: DrawedObjectParams) {
        this.objects[id] = new DrawedObject(objectParams);
    }
}
