abstract class EntityLoader<T> {
    public URLs: Record<string, string>;
    public data: Record<string, T> = {};

    constructor(URLs: Record<string, string>) {
        this.URLs = URLs;
    }

    setData(name: string, value: any) {
        this.data[name] = <T>value;
    }

    abstract get(name: string): Promise<T>;
}

export class TextLoader extends EntityLoader<string> {
    async get(name: string): Promise<string> {
        const response = await fetch(this.URLs[name]);
        return response.text();
    };
};

export class ImageLoader extends EntityLoader<HTMLImageElement> {
    async get(name: string): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.src = this.URLs[name];
        });
    }
}

export class Loader {
    public static async load(...entities: EntityLoader<any>[]): Promise<any[]> {
        const promises: Promise<any>[] = [];

        entities.forEach(entity => {
            for (let name in entity.URLs) {
                const dataPromise = entity.get(name);
                promises.push(dataPromise.then((data) => {
                    entity.setData(name, data);
                }));
            }
        });

        return Promise.all(promises);
    }
}