import { _decorator, Component, instantiate, Node, Prefab, resources, size, SpriteFrame, UITransform } from 'cc';
import { AccountInfo } from '../AccountInfo';
import { RES_URL } from '../Constants';
import { Item } from '../Item';
import { BagItem } from './BagItem';
const { ccclass, property } = _decorator;

@ccclass('BagScrollView')
export class BagScrollView extends Component {

    @property(Node)
    content: Node;

    start() {
        let myBag = AccountInfo.getInstance().bag;
        myBag.forEach((item, key) => {
            resources.load(RES_URL.bagItem, Prefab, (error, prefab) => {
                if (prefab) {
                    let itemNode = instantiate(prefab);
                    let bagItem = itemNode.getComponent(BagItem);
                    bagItem.amount.string = item.amount.toString();
                    resources.load(item.spriteFrame + "/spriteFrame", SpriteFrame, (error, spriteFrame) => {
                        if (spriteFrame) {
                            bagItem.icon.spriteFrame = spriteFrame;
                            bagItem.icon.getComponent(UITransform).setContentSize(size(128, 128));
                        }
                    })
                    this.content.addChild(itemNode);
                }
            })
        });
    }

    update(deltaTime: number) {

    }
}


