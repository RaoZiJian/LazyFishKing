import { Asset, resources } from "cc";

export namespace ResourceLoader {
    /**
     * 异步加载资源函数
     * 该函数用于从指定路径异步加载一个资源，并返回一个Promise对象
     * 当资源成功加载时，Promise对象会解析为加载的资源对象
     * 如果加载过程中发生错误，Promise对象会拒绝并返回错误信息
     * 
     * @param path 资源的路径，用于指定需要加载的资源位置
     * @returns 返回一个Promise对象，解析为加载的资源对象
     *          如果加载失败，Promise会被拒绝并返回错误信息
     */
    export async function loadResAsync<T extends Asset>(path: string): Promise<T> {
        return new Promise((resolve, reject) => {
            // 使用resources.load方法加载指定路径的资源
            // 如果加载成功，调用resolve方法解析为加载的资源
            // 如果加载失败，调用reject方法返回错误信息
            resources.load(path, (err: Error, asset: T) => {
                if (err) reject(err);
                else resolve(asset);
            });
        });
    }

    /**
     * 异步加载多个资源并返回一个映射关系
     * 该函数接收一组资源路径，并异步加载这些路径对应的资源。
     * 加载完成后，将每个路径与其对应的资源对象建立映射关系，并返回这个映射关系。
     * 
     * @param paths 资源路径数组，包含需要加载的所有资源的路径
     * @returns 返回一个Map对象，键为资源路径，值为对应的已加载资源对象
     */
    export async function loadResources(paths: string[]): Promise<Map<string, any>> {
        // 创建一个Promise数组，每个Promise负责加载一个指定路径的资源
        const promises = paths.map(path => loadResAsync(path));
        const assets = await Promise.all(promises);

        // 根据路径和对应加载的资源创建一个Map对象，并返回
        return new Map(paths.map((path, i) => [path, assets[i]]));
    }
}