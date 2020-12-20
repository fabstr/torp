import { mat3, vec2 } from "gl-matrix";
import { Boilerplate } from "./boilerplate";

export interface DrawedObjectParams {
    bp: Boilerplate;
    program: WebGLProgram;
    uniforms: string[]
    attribs: string[]
    geometry: number[];
    texture: string;
    x?: number;
    y?: number;
    texturePositionX?: number;
    texturePositionY?: number;
    textureWidth?: number;
    textureHeight?: number;
}

export class DrawedObject {
    private gl: WebGL2RenderingContext;
    private bp: Boilerplate;
    private program: WebGLProgram;
    private geometryVerticesBuffer: WebGLBuffer;
    private textureBuffer: WebGLBuffer;
    private vertexArray: WebGLVertexArrayObject;
    private attribs: Record<string, number> = {};
    private uniforms: Record<string, WebGLUniformLocation> = {};
    private texture: WebGLTexture;

    private projectionMatrix: mat3;
    private translation: vec2 = [0, 0];
    private rotation: number = 0;
    private scale: vec2 = [1, 1];

    constructor(params: DrawedObjectParams) {
        this.bp = params.bp;
        this.gl = this.bp.gl;
        this.program = params.program;
        this.uniforms = this.bp.getUniformLocations(this.program, params.uniforms);
        this.attribs = this.bp.getAttribLocations(this.program, params.attribs);

        this.geometryVerticesBuffer = this.bp.createBuffer();
        this.initGeometryBuffer(params.geometry);
        this.vertexArray = this.bp.createVertexArray();
        this.gl.bindVertexArray(this.vertexArray);

        this.textureBuffer = this.bp.createBuffer();
        this.initTextureCoordinatesBuffer(params);
        this.texture = this.bp.createTexture(params.texture);

        this.projectionMatrix = this.calculateProjectionMatrix();

        if (params.x !== undefined && params.y !== undefined) {
            this.setPosition(params.x, params.y);
        }
    }

    initGeometryBuffer(geometry: number[]) {
        // upload vertex data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometryVerticesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometry), this.gl.STATIC_DRAW);
    }

    initTextureCoordinatesBuffer(params: DrawedObjectParams) {
        const x1: number = params.texturePositionX !== undefined ? params.texturePositionX : 0;
        const y1: number = params.texturePositionY !== undefined ? params.texturePositionY : 0;
        const x2: number = x1 + (params.textureWidth !== undefined ? params.textureWidth : 1);
        const y2: number = y1 + (params.textureHeight !== undefined ? params.textureHeight : 1);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x1, y2,
            x2, y2,
            x1, y1,
            x2, y1,
            x2, y2
        ]), this.gl.STATIC_DRAW);
    }

    calculateProjectionMatrix(): mat3 {
        const width = this.gl.canvas.width;
        const height = this.gl.canvas.height;
        return [
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

    setScale(x: number, y: number) {
        this.scale = [x, y];
    }

    getTransformationMatrix(): mat3 {
        const matrix = mat3.clone(this.projectionMatrix);
        mat3.translate(matrix, matrix, this.translation);
        mat3.rotate(matrix, matrix, this.rotation);
        mat3.scale(matrix, matrix, this.scale);
        return matrix;
    }

    render() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometryVerticesBuffer);
        this.gl.vertexAttribPointer(this.attribs['a_position'], 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.attribs['a_position']);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.vertexAttribPointer(this.attribs['a_textureCoordinates'], 2, this.gl.FLOAT, true, 0, 0);
        this.gl.enableVertexAttribArray(this.attribs['a_textureCoordinates']);

        this.gl.useProgram(this.program);
        this.gl.uniformMatrix3fv(this.uniforms['u_matrix'], false, this.getTransformationMatrix());

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.uniforms['u_texture'], 0);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}