import { Loader } from "./loader";

export class WebGLBoilerplate {
    private canvas: HTMLCanvasElement;
    private shaderSources: Record<string, string> = {};
    private loader: Loader;
    private locations: Record<string, WebGLUniformLocation | number> = {};
    public gl: WebGL2RenderingContext;
    public program: WebGLProgram | null = null;

    constructor() {
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

        this.loader = new Loader();
        this.loader.addSource('fragment', 'resources/shaders/fragment.frag');
        this.loader.addSource('vertex', 'resources/shaders/vertex.vert');
    }

    async load(): Promise<WebGLBoilerplate> {
        return this.loader.load().then(source => {
            this.shaderSources = source;
            return this;
        });
    }

    createShader(type: number, shaderName: string): WebGLShader {
        const source = this.shaderSources[shaderName];
        const shader = this.gl.createShader(type);

        if (shader === null) {
            throw new Error('shader is null');
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

    createVertexShader(name: string): WebGLShader {
        return this.createShader(this.gl.VERTEX_SHADER, name);
    }

    createFragmentShader(name: string): WebGLShader {
        return this.createShader(this.gl.FRAGMENT_SHADER, name);
    }

    createProgram(shaders: WebGLShader[]): WebGLProgram {
        const program: WebGLProgram | null = this.gl.createProgram();
        if (program === null) {
            throw new Error('program is null');
        }

        for (let shader of shaders) {
            this.gl.attachShader(program, shader);
        }

        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.deleteProgram(program);
            const msg = this.gl.getProgramInfoLog(program);
            if (msg === null) {
                throw new Error('msg is null');
            }
            throw new Error(msg);
        }

        this.program = program;
        return program;
    }

    resize() {
        const cssToRealPixels = window.devicePixelRatio || 1;

        // Lookup the size the browser is displaying the canvas in CSS pixels
        // and compute a size needed to make our drawingbuffer match it in
        // device pixels.
        const displayWidth = Math.floor(this.canvas.clientWidth * cssToRealPixels);
        const displayHeight = Math.floor(this.canvas.clientHeight * cssToRealPixels);

        // Check if the canvas is not the same size.
        if (this.canvas.width !== displayWidth ||
            this.canvas.height !== displayHeight) {

            // Make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }

    getUniformLocation(name: string): WebGLUniformLocation {
        if (this.program === null) {
            throw new Error("program is null, create a program first!");
        }

        const uniform_location = this.gl.getUniformLocation(this.program, name);
        if (uniform_location === null) {
            throw new Error('Could not get uniform location of ' + name);
        }

        return uniform_location;
    }

    getAttribLocation(name: string): number {
        if (this.program === null) {
            throw new Error("program is null, create a program first!");
        }

        const attribute_location = this.gl.getAttribLocation(this.program, name);
        if (attribute_location === null) {
            throw new Error('Could not get uniform location of ' + name);
        }

        return attribute_location;
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
}