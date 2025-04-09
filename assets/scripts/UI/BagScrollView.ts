import { _decorator, Component, instantiate, Node, Prefab, resources, size, SpriteFrame, UITransform } from 'cc';
import { AccountInfo } from '../AccountInfo';
import { RES_URL } from '../Constants';
import { BagItem } from './BagItem';
const { ccclass, property } = _decorator;

/**
 * @class BagScrollView
 * @brief 负责背包中物品的显示和滚动视图的管理
 */
@ccclass('BagScrollView')
export class BagScrollView extends Component {
    @property({ type: Node ,tooltip: "背包物品展示的内容区域" })
    content: Node;
    /**
     * 组件生命周期方法 - start
     * 用于初始化背包视图，加载并显示背包中的物品
     */
    start() {
        // 遍历账户信息中的背包物品
        let myBag = AccountInfo.bag;
        myBag.forEach((item, key) => {
            // 加载物品预制体
            resources.load(RES_URL.bagItem, Prefab, (error, prefab) => {
                if (prefab) {
                    let itemNode = instantiate(prefab);
                    let bagItem = itemNode.getComponent(BagItem);
                    bagItem.amount.string = item.amount.toString();
                    resources.load(item.spriteFrame + "/spriteFrame", SpriteFrame, (error, spriteFrame) => {
                        if (spriteFrame) {
                            // 设置物品图标和大小
                            bagItem.icon.spriteFrame = spriteFrame;
                            bagItem.icon.getComponent(UITransform).setContentSize(size(128, 128));
                        }
                    })
                    this.content.addChild(itemNode);
                }
            })
        });
    }
}