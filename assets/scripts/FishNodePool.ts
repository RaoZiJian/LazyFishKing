import { instantiate, Prefab, Node } from "cc";
import { ResourceLoader } from "./ResourceLoader";

export class FishNodePool {
    // 单例实例
    private static _instance: FishNodePool | null = null;
    // 资源池存储（使用 Map 提升检索性能）
    private pools: Map<string, Node[]> = new Map();

    // 私有构造器实现单例
    private constructor() { }

    // 单例访问点
    public static get instance(): FishNodePool {
        if (!this._instance) {
            this._instance = new FishNodePool();
        }
        return this._instance;
    }

    // 新增单资源预加载方法
    public static async preloadSingle(url: string, count: number): Promise<void> {
        return await this.instance._preload(url, count);
    }

    // 核心预加载逻辑
    private async _preload(url: string, count: number): Promise<void> {
        try {
            const prefab = await ResourceLoader.loadResAsync<Prefab>(url);
            const nodes = Array.from({ length: count }, () => instantiate(prefab!));
            const existing = this.pools.get(url) || [];
            this.pools.set(url, [...existing, ...nodes]);
        } catch (e) {
            console.error(`预加载失败: ${url}`, e);
        }
    }

    // 获取实例（带自动扩容）
    public static async get(url: string): Promise<Node> {
        const pool = this.instance.pools.get(url) || [];
        if (pool.length === 0) {
            console.warn(`资源池不足，动态实例化: ${url}`);
            await this._instance._preload(url, 1);
            return this.instance.pools.get(url)!.pop()!;
        }else{
            return pool.pop()!;
        }
    }
}
