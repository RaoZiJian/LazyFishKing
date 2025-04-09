import { _decorator, Component, director, Label, Node, tween, Vec3 } from 'cc';
import { PoolType, ResPool } from './ResPool';
const { ccclass, property } = _decorator;

/**
 * DamageNode 类用于显示和管理伤害数字的动画效果。
 * 它继承自 Component，利用 Cocos Creator 的组件系统来附加到场景节点。
 */
@ccclass('DamageNode')
export class DamageNode extends Component {

    /**
     * 通过 @property 装饰器声明一个 Label 类型的属性，用于显示伤害数字。
     */
    @property(Label)
    label: Label;

    /**
     * start 方法是 Component 的生命周期方法之一，当组件第一次被启用时调用。
     * 在这里，我们初始化节点的缩放比例，使其在开始时不可见。
     */
    start() {
        this.node.scale = new Vec3(0, 0, 0);
    }

    /**
     * playZoomIn 方法用于播放数字弹出（放大）的动画效果。
     * 它通过 tween 函数创建动画，分别对节点的缩放比例和位置进行变化。
     */
    playZoomIn() {
        tween(this.node)
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();

        tween(this.node)
            .by(0.2, { position: new Vec3(0, 15, 0) })
            .start();
    }

    /**
     * playZoomOut 方法用于播放数字收回（缩小）的动画效果，并在动画结束后将节点回收到资源池。
     * 这个方法展示了如何使用 tween 的 .call() 方法在动画结束后执行回调函数。
     */
    playZoomOut() {
        tween(this.node)
            .to(0.2, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                // 在动画结束后，从场景中移除节点并将其回收到 ResPool 中。
                this.node.position = new Vec3(0, this.node.position.y - 15, 0);
                this.node.removeFromParent();
                this.node.scale = new Vec3(1, 1, 1);
                ResPool.Instance.putNode(PoolType.DAMAGE, this.node);
            })
            .start();
    }
}