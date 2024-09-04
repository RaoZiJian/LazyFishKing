import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import { RES_URL } from './Constants';
const { ccclass, property } = _decorator;

@ccclass('FireAreaFiled')
export class FireAreaFiled extends Component {

    private _clickNode: Node;
    public get clickNode(): Node {
        return this._clickNode;
    }
    public set clickNode(value: Node) {
        this._clickNode = value;
    }

    private _clickBulletPrefab: Prefab;
    public get clickBulletPrefab(): Prefab {
        return this._clickBulletPrefab;
    }
    public set clickBulletPrefab(value: Prefab) {
        this._clickBulletPrefab = value;
    }

    start() {
        resources.load(RES_URL.clickEffect, Prefab, (error, prefab) => {
            if (prefab) {
                this.clickNode = instantiate(prefab);
            }
        })

        resources.load(RES_URL.clickBullet, Prefab, (error, prefab) => {
            if(prefab){
                this.clickBulletPrefab = prefab;
            }
        })
    }

    update(deltaTime: number) {

    }
}


