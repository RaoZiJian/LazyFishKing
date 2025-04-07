import { Asset, resources } from "cc";

export namespace ResourceLoader {
    export function loadResAsync<T extends Asset>(path: string): Promise<T> {
        return new Promise((resolve, reject) => {
            resources.load(path, (err: Error, asset: T) => {
                if (err) reject(err);
                else resolve(asset);
            });
        });
    }
}