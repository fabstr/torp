import { Boilerplate } from "./boilerplate";
import { DrawedObject } from "./drawedObject";
import { Matrix } from "./Matrix";
import { DrawingWindow, ItemType } from "./app";

interface MapData {
    contents: number[][];
    width: number; // in units
    height: number; // in units
}


export class MapLayer {
    private contents: Matrix;
    private width;
    private height;
    private drawedObjects: Record<string, DrawedObject>;

    constructor(data: MapData, objects: Record<string, DrawedObject>) {
        this.contents = Matrix.fromJSON(data.contents);
        this.width = data.width;
        this.width = data.width;
        this.height = data.height;
        this.drawedObjects = objects;
    }

    public addDrawedObject(id: string, drawedObject: DrawedObject) {
        this.drawedObjects[id] = drawedObject;
    }

    public static fromString(data: string, bp: Boilerplate, program: WebGLProgram): MapLayer {
        const parsed = JSON.parse(data);
        const objects: Record<string, DrawedObject> = {};
        for (let name in parsed['objects']) {
            const params = parsed['objects'][name];
            objects[name] = new DrawedObject(bp, program, params);
        }
        return new MapLayer(parsed['map'], objects);
    }

    render(drawingWindow: DrawingWindow) {
        this.contents.forEach((y: number, x: number, value: ItemType) => {
            const xPixels = x * 64;
            const yPixels = y * 64;

            if (xPixels < drawingWindow.x1 || yPixels < drawingWindow.y1 ||
                xPixels > drawingWindow.x2 || yPixels > drawingWindow.y2) {
                return;
            }

            let item: DrawedObject | undefined = undefined;
            console.log([x, y, value]);
            if (value === ItemType.Gravel) {
                item = this.drawedObjects['gravel'];
            } else if (value === ItemType.Grass) {
                item = this.drawedObjects['grass'];
            } else if (value === ItemType.Flower) {
                item = this.drawedObjects['flower'];
            }

            if (item !== undefined) {
                item.setPosition(xPixels, yPixels);
                item.render();
            }
        });
    }
}
