import { mat3, vec2 } from "gl-matrix";
import { WebGLBoilerplate } from "./webglboilerplate";

export class App {
    bp: WebGLBoilerplate;
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    a_position: number;
    u_color: WebGLUniformLocation;
    u_matrix: WebGLUniformLocation;

    positionBuffer: WebGLBuffer;
    vao: WebGLVertexArrayObject;


    constructor(bp: WebGLBoilerplate) {
        this.bp = bp;
        this.gl = bp.gl;

        this.program = this.bp.createProgram([
            this.bp.createVertexShader('vertex'),
            this.bp.createFragmentShader('fragment')
        ]);


        this.a_position = this.bp.getAttribLocation('a_position');
        // this.u_resolution = this.bp.getUniformLocation('u_resolution');
        this.u_color = this.bp.getUniformLocation('u_color');
        this.u_matrix = this.bp.getUniformLocation('u_matrix');

        this.positionBuffer = this.bp.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        this.vao = this.bp.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.gl.enableVertexAttribArray(this.a_position);
        this.gl.vertexAttribPointer(
            this.a_position,
            2, // size, components per iteration
            this.gl.FLOAT, // type
            false, // don't normalize
            0, // stride
            0 // offset
        );
    }

    private projectionMatrix(): mat3 {
        const width = this.gl.canvas.width;
        const height = this.gl.canvas.height;
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];
    }

    private getTransformationMatrix(translation: vec2, scale: vec2, rotation = 0): mat3 {
        const matrix = this.projectionMatrix();
        mat3.translate(matrix, matrix, translation);
        mat3.rotate(matrix, matrix, rotation);
        mat3.scale(matrix, matrix, scale);
        return matrix;
    }

    private degreesToRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    run() {
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
    }

    private setRectangle(x: number, y: number, width: number, height: number): void {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;
        const arr = [
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,

            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,

            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.STATIC_DRAW);
    }
}