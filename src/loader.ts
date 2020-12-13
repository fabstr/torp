export class Loader {
    private sources: Record<string, string> = {};

    constructor() { }

    public addSource(name: string, url: string) {
        this.sources[name] = url;
    }

    private async get(name: string, url: string): Promise<Record<string, string>> {
        const response = await (fetch(url));
        const data = await response.text()

        const o: Record<string, string> = {};
        o[name] = data;
        return o;
    };

    public async load(): Promise<Record<string, string>> {
        const promises: Promise<Record<string, string>>[] = [];
        for (let key in this.sources) {
            promises.push(this.get(key, this.sources[key]));
        }
        return Promise.all(promises)
            .then(sourcesArray => {
                const o: Record<string, string> = {};
                sourcesArray.forEach(pair => {
                    for (let key in pair) {
                        o[key] = pair[key];
                    }
                });
                return o;
            });
    }
}