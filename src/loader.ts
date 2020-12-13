import { App } from "./app";
import { Boilerplate } from "./boilerplate";

type NameURLPair = Record<string, string>;
type Shader = Record<string, string>;
type Texture = Record<string, HTMLImageElement>;

enum PairType {
    Shader, Texture
};

class Pair {
    name: string;
    data: string | HTMLImageElement;
    type: PairType

    constructor(name: string, data: string | HTMLImageElement, type: PairType) {
        this.name = name;
        this.data = data;
        this.type = type;
    }
}

class Resources {
    shaderSources: Shader;
    textures: Texture;
    constructor(shaderSources: Shader, textures: Texture) {
        this.shaderSources = shaderSources;
        this.textures = textures;
    }
}

export class Loader {
    private shaderSources: NameURLPair = {};
    private textureURLs: NameURLPair = {};

    constructor(shaderSources: NameURLPair, textureURLs: NameURLPair) {
        this.shaderSources = shaderSources;
        this.textureURLs = textureURLs;
    }

    private async getShaderSource(name: string): Promise<Pair> {
        const url = this.shaderSources[name];
        const response = await (fetch(url));

        const data = await response.text();
        return new Pair(name, data, PairType.Shader);
    };

    private async getTexture(name: string): Promise<Pair> {
        return new Promise(resolve => {
            const image = new Image();
            image.addEventListener('load', () => {
                const o: Record<string, HTMLImageElement> = {};
                resolve(new Pair(name, image, PairType.Texture));
            });
            image.src = this.textureURLs[name];
        });
    }

    public async load(): Promise<Resources> {
        const promises: Promise<Pair>[] = [];

        for (let key in this.shaderSources) {
            promises.push(this.getShaderSource(key));
        }

        for (let key in this.textureURLs) {
            promises.push(this.getTexture(key));
        }

        return Promise.all(promises)
            .then(pairs => {
                const loadedShaderSources: Shader = {};
                const loadedTextures: Texture = {};
                pairs.forEach(pair => {
                    if (pair.type === PairType.Shader) {
                        loadedShaderSources[pair.name] = <string>pair.data;
                    } else if (pair.type === PairType.Texture) {
                        loadedTextures[pair.name] = <HTMLImageElement>pair.data;
                    }
                });
                return new Resources(loadedShaderSources, loadedTextures);
            });
    }

    static async load(shaderSources: NameURLPair, textureURLs: NameURLPair): Promise<Resources> {
        const loader = new Loader(shaderSources, textureURLs);
        return loader.load();
    }
}