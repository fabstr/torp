import { mat3, vec2 } from "gl-matrix";
import { WebGLBoilerplate } from "./webglboilerplate";

interface DrawedObjectParams {
    bp: WebGLBoilerplate;
    program: WebGLProgram;
    uniforms: string[]
    attribs: string[]
    geometry: number[];
    x?: number;
    y?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
}

export class DrawedObject {
    private bp: WebGLBoilerplate;
    private program: WebGLProgram;
    private buffer: WebGLBuffer;
    private vertexArray: WebGLVertexArrayObject;
    private attribs: Record<string, number> = {};
    private uniforms: Record<string, WebGLUniformLocation> = {};

    private projectionMatrix: mat3;
    private translation: vec2;
    private rotation: number;
    private scale: vec2;

    constructor({
        bp,
        program,
        uniforms,
        attribs,
        geometry,
        x = 0,
        y = 0,
        rotation = 0,
        scaleX = 1,
        scaleY = 1
    }: DrawedObjectParams) {
        this.bp = bp;
        this.program = program;
        this.vertexArray = this.bp.createVertexArray();
        this.uniforms = this.bp.getUniformLocations(this.program, uniforms);
        this.attribs = this.bp.getAttribLocations(this.program, attribs);
        this.translation = [x, y];
        this.rotation = rotation;
        this.scale = [scaleX, scaleY];

        const buffer = this.bp.gl.createBuffer();
        if (buffer === null) {
            throw new Error("buffer is null");
        }
        this.buffer = buffer;

        // upload data
        this.bp.gl.bindBuffer(this.bp.gl.ARRAY_BUFFER, this.buffer);
        this.bp.gl.bufferData(this.bp.gl.ARRAY_BUFFER, new Float32Array(geometry), this.bp.gl.STATIC_DRAW);

        const width = this.bp.gl.canvas.width;
        const height = this.bp.gl.canvas.height;
        this.projectionMatrix = [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];

    }

    setPosition(x: number, y: number) {
        this.translation = [x, y];
    }

    setRotationRadians(angle: number) {
        this.rotation = angle;
    }

    setRotationDegrees(angle: number) {
        this.setRotationRadians(angle * Math.PI / 180);
    }

    render() {
        // use this object's program
        this.bp.gl.useProgram(this.program);

        // use this object's vertex array
        this.bp.gl.bindVertexArray(this.vertexArray);
        this.bp.gl.enableVertexAttribArray(this.attribs['a_position']);
        this.bp.gl.vertexAttribPointer(this.attribs['a_position'], 2, this.bp.gl.FLOAT, false, 0, 0);

        // set the colour
        const color = [Math.random(), Math.random(), Math.random(), 1];
        this.bp.gl.uniform4fv(this.uniforms['u_color'], color);

        // bind the position buffer
        this.bp.gl.bindBuffer(this.bp.gl.ARRAY_BUFFER, this.buffer);

        // compute and bind the transformation matrix
        const matrix = this.getTransformationMatrix();
        this.bp.gl.uniformMatrix3fv(this.uniforms['u_matrix'], false, matrix);

        // drawArrays or drawElements
        this.bp.gl.drawArrays(this.bp.gl.TRIANGLES, 0, 6);
    }

    private getTransformationMatrix(): mat3 {
        const matrix = mat3.clone(this.projectionMatrix);
        mat3.translate(matrix, matrix, this.translation);
        mat3.rotate(matrix, matrix, this.rotation);
        mat3.scale(matrix, matrix, this.scale);
        return matrix;
    }
}
/*

        this.bp.resize();

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear the canvas
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.program);

        // Bind the attribute/buffer set we want.
        this.gl.bindVertexArray(this.vao);

        const color = [Math.random(), Math.random(), Math.random(), 1];
        this.gl.uniform4fv(this.u_color, color);

        // Update the position buffer with rectangle positions
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        this.setRectangle(0, 0, 30, 100);

        const matrix = this.getTransformationMatrix(
            [300, 200],
            [1, 1],
            this.degreesToRadians(0)
        )
        this.gl.uniformMatrix3fv(this.u_matrix, false, matrix);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 18);
        */