export class Boilerplate {
    private canvas: HTMLCanvasElement;
    private shaderSources: Record<string, string> = {};
    public gl: WebGL2RenderingContext;

    private textureImages: Record<string, HTMLImageElement>;
    private textureCache: Record<string, WebGLTexture> = {};

    constructor(shaderSources: Record<string, string>, textureImages: Record<string, HTMLImageElement>) {
        const canvas: HTMLCanvasElement | null = document.querySelector("#c");
        if (canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas = canvas;

        const gl: WebGL2RenderingContext | null = this.canvas.getContext("webgl2");
        if (gl === null) {
            throw new Error("No webgl2");
        }
        this.gl = gl;
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.shaderSources = shaderSources;
        this.textureImages = textureImages;
    }

    createProgram(vertexShaderName: string, fragmentShaderName: string): WebGLProgram {
        const program: WebGLProgram | null = this.gl.createProgram();
        if (program === null) {
            throw new Error('program is null');
        }

        this.gl.attachShader(program, this.createVertexShader(vertexShaderName));
        this.gl.attachShader(program, this.createFragmentShader(fragmentShaderName));

        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.deleteProgram(program);
            const msg = this.gl.getProgramInfoLog(program);
            if (msg === null) {
                throw new Error('msg is null');
            }
            throw new Error(msg);
        }

        return program;
    }

    createVertexShader(name: string): WebGLShader {
        return this.createShader(this.gl.VERTEX_SHADER, name);
    }

    createFragmentShader(name: string): WebGLShader {
        return this.createShader(this.gl.FRAGMENT_SHADER, name);
    }

    createShader(type: number, shaderName: string): WebGLShader {
        const source = this.shaderSources[shaderName];
        const shader = this.gl.createShader(type);

        if (shader === null) {
            throw new Error('shader is null');
        }

        if (source === undefined) {
            throw new Error(`Unknown shader "${shaderName}"`);
        }

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const msg = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            if (msg === null) {
                throw new Error('msg is null');
            }
            throw new Error(msg);
        }

        return shader;
    }

    createTexture(name: string): WebGLTexture {
        if (this.textureCache[name] !== undefined) {
            return this.textureCache[name];
        }

        const texture: WebGLTexture | null = this.gl.createTexture();
        if (texture === null) {
            throw new Error("texture is null");
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        const image = this.textureImages[name];
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        } else {
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        }
        // });

        this.textureCache[name] = texture;
        return texture;
    }

    isPowerOf2(value: number): boolean {
        return (value & (value - 1)) == 0;
    }

    resize() {
        const cssToRealPixels = window.devicePixelRatio || 1;
        const displayWidth = Math.floor(this.canvas.clientWidth * cssToRealPixels);
        const displayHeight = Math.floor(this.canvas.clientHeight * cssToRealPixels);

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }

    createBuffer(): WebGLBuffer {
        const buffer = this.gl.createBuffer();
        if (buffer === null) {
            throw new Error("Buffer is null!");
        }
        return buffer;
    }

    createVertexArray() {
        const array = this.gl.createVertexArray();
        if (array === null) {
            throw new Error("vertex is null!");
        }
        return array;
    }

    getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation {
        const uniformLocation = this.gl.getUniformLocation(program, name);
        if (uniformLocation === null) {
            throw new Error('Could not get uniform location of ' + name);
        }

        return uniformLocation;
    }

    getUniformLocations(program: WebGLProgram, names: string[]): Record<string, WebGLUniformLocation> {
        const uniforms: Record<string, WebGLUniformLocation> = {};
        names.forEach(name => {
            uniforms[name] = this.getUniformLocation(program, name);
        });
        return uniforms;
    }

    getAttribLocation(program: WebGLProgram, name: string): number {
        const attribute_location = this.gl.getAttribLocation(program, name);
        if (attribute_location === null) {
            throw new Error('Could not get uniform location of ' + name);
        }

        return attribute_location;
    }

    getAttribLocations(program: WebGLProgram, names: string[]): Record<string, number> {
        const uniforms: Record<string, number> = {};
        names.forEach(name => {
            uniforms[name] = this.getAttribLocation(program, name);
        });
        return uniforms;
    }
}
