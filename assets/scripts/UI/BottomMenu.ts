import { _decorator, Button, Component, director, instantiate, Node, Prefab, resources, UITransform } from 'cc';
import { RES_URL } from '../Constants';
import { PopUp } from './PopUp';
const { ccclass, property } = _decorator;

@ccclass('BottomMenu')
export class BottomMenu extends Component {

    @property(Button)
    roleBtn: Button

    @property(Button)
    bagBtn: Button;
    
    private _popUp: PopUp;
    public get popUp(): PopUp {
        return this._popUp;
    }
    public set popUp(value: PopUp) {
        this._popUp = value;
    }

    private ROLE_POP_UP = "ROLE_POP_UP";
    private BAG_POP_UP = "BAG_POP_UP";


    start() {
        this.roleBtn.node.on(Button.EventType.CLICK, () => {
            this.openPopUP(this.ROLE_POP_UP);
        }, this)

        this.bagBtn.node.on(Button.EventType.CLICK, () => {
            this.openPopUP(this.BAG_POP_UP);
        }, this)
    }

    openPopUP(name: string) {
        resources.load(RES_URL.popUpPrefab, Prefab, (error, prefab) => {
            if (prefab) {
                if (this.popUp) {
                    this.popUp.close();
                    this.popUp = undefined;
                }

                let popUpNode = instantiate(prefab)
                this.popUp = popUpNode.getComponent(PopUp);
                let uitrans = popUpNode.getComponent(UITransform);
                uitrans.priority = 1;
                switch (name) {
                    case this.ROLE_POP_UP:
                        this.addRolePopUp();
                        break;
                    case this.BAG_POP_UP:
                        this.addBagPopUp();
                        break;
                    default:
                        break;
                }

                director.getScene().getChildByName("Canvas").addChild(popUpNode);
            }
        })
    }

    addRolePopUp() {
        if (this.popUp) {
            this.popUp.title.string = "角色升级";
        }
    }

    addBagPopUp() {
        if (this.popUp) {
            this.popUp.title.string = "背包";
        }
    }

    update(deltaTime: number) {

    }
}


