import { _decorator, Component, instantiate, Node, NodePool, Prefab, resources } from 'cc';
import { RES_URL } from './Constants';
const { ccclass, property } = _decorator;

@ccclass('ResPool')
export class ResPool extends Component {

    private _poolDict = {};
    public get poolDict() {
        return this._poolDict;
    }
    public set poolDict(value) {
        this._poolDict = value;
    }

    private _damagePrefab: Prefab;
    public get damagePrefab(): Prefab {
        return this._damagePrefab;
    }
    public set damagePrefab(value: Prefab) {
        this._damagePrefab = value;
    }

    private _buffPrefab: Prefab;
    public get buffPrefab(): Prefab {
        return this._buffPrefab;
    }
    public set buffPrefab(value: Prefab) {
        this._buffPrefab = value;
    }

    private _explosionPrefab: Prefab;
    public get explosionPrefab(): Prefab {
        return this._explosionPrefab;
    }
    public set explosionPrefab(value: Prefab) {
        this._explosionPrefab = value;
    }

    private _clickBulletPrefab: Prefab;
    public get clickBulletPrefab(): Prefab {
        return this._clickBulletPrefab;
    }
    public set clickBulletPrefab(value: Prefab) {
        this._clickBulletPrefab = value;
    }

    private _windMagicPrefab: Prefab;
    public get windMagicPrefab(): Prefab {
        return this._windMagicPrefab;
    }
    public set windMagicPrefab(value: Prefab) {
        this._windMagicPrefab = value;
    }

    start() {
        resources.load(RES_URL.damage, Prefab, (error, prefab) => {
            if (prefab) {
                this.damagePrefab = prefab;
            }
        })

        resources.load(RES_URL.buff, Prefab, (error, prefab) => {
            if (prefab) {
                this.buffPrefab = prefab;
            }
        })

        resources.load(RES_URL.explosion, Prefab, (error, prefab) => {
            if (prefab) {
                this.explosionPrefab = prefab;
            }
        })

        resources.load(RES_URL.clickBullet, Prefab, (error, prefab) => {
            if (prefab) {
                this.clickBulletPrefab = prefab;
            }
        })
    }

    loadWindMagicSkill(){
        resources.load(RES_URL.windMagic, Prefab, (error, prefab) => {
            if (prefab) {
                this.windMagicPrefab = prefab;
            }
        })
    }

    getWindMagicNode(){
        if(this.windMagicPrefab){
            return this.getNode(this.windMagicPrefab);
        }
    }

    getDamageNode() {
        if(this.damagePrefab){
            return this.getNode(this.damagePrefab);
        }
    }

    getBuffNode() {
        if(this.buffPrefab){
            return this.getNode(this.buffPrefab);
        }
    }

    getExplosionNode() {
        if(this.explosionPrefab){
            return this.getNode(this.explosionPrefab);
        }
    }

    getClickBulletNode() {
        if(this.clickBulletPrefab){
            return this.getNode(this.clickBulletPrefab);
        }
    }

    getNode(prefab: Prefab) {
        const name = prefab.name;
        let node: Node;
        if (this.poolDict.hasOwnProperty(name)) {
            const pool = this.poolDict[name] as NodePool;
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = instantiate(prefab);
            }
        } else {
            const pool = new NodePool();
            this.poolDict[name] = pool;

            node = instantiate(prefab);
        }

        return node;
    }

    putNode(node: Node) {
        const name = node.name;
        let pool: NodePool;

        if (this.poolDict.hasOwnProperty(name)) {
            pool = this.poolDict[name] as NodePool;
        } else {
            pool = new NodePool;
            this.poolDict[name] = pool;
        }
        pool.put(node);
    }

    clearPool(name: string) {
        if(this.poolDict.hasOwnProperty(name)){
            this.poolDict[name].clear();
        }
    }
}


