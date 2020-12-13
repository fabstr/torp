import { App } from "./app";
import { Boilerplate } from "./boilerplate";
import { Loader } from "./loader";

function main() {
    const shaderURLs = {
        'fragment': 'resources/shaders/fragment.frag',
        'vertex': 'resources/shaders/vertex.vert'
    };
    const textureURLs = {
        'f-texture': 'resources/f-texture.png'
    }
    Loader.load(shaderURLs, textureURLs).then(resources => {
        const bp = new Boilerplate(resources.shaderSources, resources.textures);
        const app = new App(bp);
        app.run();
    });
}
main();