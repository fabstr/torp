type NameURLPair = Record<string, string>;
type Shader = Record<string, string>;
type Texture = Record<string, HTMLImageElement>;
type Map = Record<string, any>;
type getter = (name: string) => Promise<Pair>;

enum PairType {
    Shader,
    Texture,
    Map
};

interface LoaderEntity<T> {
    URLs: NameURLPair;
    getFunction: getter;
    data: Record<string, T>;
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
    private mapURLs: NameURLPair = {};

    constructor(shaderSources: NameURLPair, textureURLs: NameURLPair, mapURLs: NameURLPair) {
        this.shaderSources = shaderSources;
        this.textureURLs = textureURLs;
        this.mapURLs = mapURLs;
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

    private async getMap(name: string): Promise<Pair> {
        const url = this.shaderSources[name];
        const response = await (fetch(url));
        const data = await response.text();
        return new Pair(name, JSON.parse(data), PairType.Shader);
    }

    public async load(): Promise<Resources> {
        const promises: Promise<Pair>[] = [];

        for (let key in this.shaderSources) {
            promises.push(this.getShaderSource(key));
        }

        for (let key in this.textureURLs) {
            promises.push(this.getTexture(key));
        }

        for (let key in this.mapURLs) {
            promises.push(this.getMap(key));
        }

        return Promise.all(promises)
            .then(pairs => {
                const loadedShaderSources: Shader = {};
                const loadedTextures: Texture = {};
                const loadedMaps: Record<string, any> = {};
                pairs.forEach(pair => {
                    if (pair.type === PairType.Shader) {
                        loadedShaderSources[pair.name] = <string>pair.data;
                    } else if (pair.type === PairType.Texture) {
                        loadedTextures[pair.name] = <HTMLImageElement>pair.data;
                    } else if (pair.type === PairType.Map) {
                        loadedMaps[pair.name] = <Map>pair.data;
                    }
                });
                return new Resources(loadedShaderSources, loadedTextures);
            });
    }

    static async load(shaderSources: NameURLPair, textureURLs: NameURLPair, mapURLs: NameURLPair): Promise<Resources> {
        const loader = new Loader(shaderSources, textureURLs, mapURLs);
        return loader.load();
    }
}