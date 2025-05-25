import { instantiate, Node, NodePool, Prefab } from 'cc';
import { ResourceLoader } from './ResourceLoader';
import { RES_URL } from './Constants';

export enum PoolType {
    DAMAGE = 'damage',
    BUFF = 'buff',
    EXPLOSION = 'explosion',
    CLICK_BULLET = 'clickBullet',
    WIND_MAGIC = 'windMagic',
    BLADE_WIND_1 = 'bladeWind1',
    BLADE_WIND_2 = 'bladeWind2',
    THUNDER_LINE = 'thunderLine'
}

export type ResourceConfig = {
    type: PoolType;
    path: string;
    preload?: boolean;
    capacity?: number;
}

export class ResPool {
    private static _instance: ResPool;
    private _poolMap = new Map<PoolType, NodePool>();
    private _prefabMap = new Map<PoolType, Prefab>();
    private _loadingMap = new Map<PoolType, Promise<void>>();

    private _resourceConfigs: ResourceConfig[] = [
        { type: PoolType.DAMAGE, path: RES_URL.damage, preload: true, capacity: 5 },
        { type: PoolType.BUFF, path: RES_URL.buff, preload: true, capacity: 5 },
        { type: PoolType.EXPLOSION, path: RES_URL.explosion, preload: true, capacity: 5 },
        { type: PoolType.CLICK_BULLET, path: RES_URL.clickBullet, preload: true, capacity: 10 },
        { type: PoolType.WIND_MAGIC, path: RES_URL.windMagic, capacity: 3 },
        { type: PoolType.BLADE_WIND_1, path: RES_URL.bladeWind1, capacity: 2 },
        { type: PoolType.BLADE_WIND_2, path: RES_URL.bladeWind2, capacity: 2 },
        { type: PoolType.THUNDER_LINE, path: RES_URL.thunderLine, capacity: 3 }
    ];

    private constructor() {
        this.initializePools();
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private initializePools() {
        this._resourceConfigs.forEach(config => {
            if (config.capacity) {
                const pool = new NodePool();
                for (let i = 0; i < config.capacity; i++) {
                    pool.put(new Node());
                }
                this._poolMap.set(config.type, pool);
            }
        });
    }

    public async initialize(preloadAll = false) {
        const loadTasks = this._resourceConfigs
            .filter(c => c.preload || preloadAll)
            .map(c => this.loadResource(c.type));

        await Promise.all(loadTasks);
    }

    private async loadResource(type: PoolType): Promise<void> {
        if (this._loadingMap.has(type)) {
            return this._loadingMap.get(type)!;
        }

        const config = this._resourceConfigs.find(c => c.type === type);
        if (!config) throw new Error(`Invalid resource type: ${type}`);

        const loadPromise = (async () => {
            try {
                const prefab = await ResourceLoader.loadResAsync<Prefab>(config.path);
                this._prefabMap.set(type, prefab);

                // 预热对象池
                if (config.capacity) {
                    const pool = new NodePool();
                    for (let i = 0; i < config.capacity; i++) {
                        console.log("prefab name is", prefab.name);
                        pool.put(instantiate(prefab));
                    }
                    this._poolMap.set(type, pool);
                }
            } catch (error) {
                console.error(`Load resource failed: ${type}`, error);
                throw error;
            } finally {
                this._loadingMap.delete(type);
            }
        })();

        this._loadingMap.set(type, loadPromise);
        return loadPromise;
    }

    public async getNode(type: PoolType): Promise<Node> {
        if (!this._prefabMap.has(type)) {
            await this.loadResource(type);
        }

        const pool = this._poolMap.get(type) || new NodePool();
        const prefab = this._prefabMap.get(type)!;

        return pool.size() > 0 ? pool.get() : instantiate(prefab);
    }

    public putNode(type: PoolType, node: Node) {
        const pool = this._poolMap.get(type) || new NodePool();
        node.removeFromParent();
        pool.put(node);
        this._poolMap.set(type, pool);
    }

    public clearPool(type?: PoolType) {
        if (type) {
            this._poolMap.get(type)?.clear();
        } else {
            this._poolMap.forEach(pool => pool.clear());
        }
    }
}