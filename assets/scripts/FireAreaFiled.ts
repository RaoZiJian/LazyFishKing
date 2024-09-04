import { _decorator, Component, director, instantiate, Node, Prefab, resources ,Animation, UIOpacity, NodeEventType, Vec3} from 'cc';
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
                const canvas = director.getScene().getChildByName("Canvas");
                canvas.addChild(this.clickNode);
                const animation =this.clickNode.getComponent(Animation);
                const uiOpacity =this.clickNode.getComponent(UIOpacity);
                animation.on(Animation.EventType.PLAY, (event)=>{
                    uiOpacity.opacity = 255;
                })
                animation.on(Animation.EventType.FINISHED, (event)=>{
                    uiOpacity.opacity = 0;
                })
            }
        })

        resources.load(RES_URL.clickBullet, Prefab, (error, prefab) => {
            if(prefab){
                this.clickBulletPrefab = prefab;
            }
        })
    }

    openFire(){
        this.node.on(NodeEventType.MOUSE_DOWN,(event)=>{
            this.clickNode.getComponent(Animation).play();
            this.clickNode.worldPosition = new Vec3(event.getUILocation().x, event.getUILocation().y, this.clickNode.worldPosition.z);
        })
    }

    closeFire(){

    }

    update(deltaTime: number) {

    }

    
}


