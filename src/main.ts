import { App } from "./app";
import { WebGLBoilerplate } from "./webglboilerplate";

function main() {
    (new WebGLBoilerplate()).load().then(bp => {
        const app = new App(bp);
        app.run();
    });
}
main();
