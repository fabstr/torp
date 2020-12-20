import { App } from "./app";
import { ImageLoader, Loader, TextLoader, } from "./loader";

function main() {
    const shaders = new TextLoader({
        'fragment': 'resources/shaders/fragment.frag',
        'vertex': 'resources/shaders/vertex.vert'
    });

    const textures = new ImageLoader({
        'sprites': 'resources/textures/sprites.png',
    });

    const map = new TextLoader({
        'ground': 'resources/map/ground.json',
        'environment': 'resources/map/environment.json',
    });

    const loader = Loader.load(shaders, textures, map).then(() => {
        const app = new App(shaders.data, textures.data);
        app.run();
    });
}
main();