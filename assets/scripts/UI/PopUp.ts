import { _decorator, Button, Component, Label, Node, NodeEventType, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * PopUp类用于管理弹窗组件的行为，包括弹窗的显示、关闭等功能
 * 该类通过装饰器注入到一个游戏节点中，从而控制弹窗的显示和交互
 */
@ccclass('PopUp')
export class PopUp extends Component {

    @property({ type: Label , tooltip: "弹窗标题" })
    title: Label;

    @property({ type: Button, tooltip: "关闭按钮" })
    closeBtn: Button;

    @property({ type: Button, tooltip: "遮罩层按钮" })
    maskBtn:Button;

    private _startScale: Vec3;

    /**
     * closeCallback属性用于存储弹窗关闭时的回调函数
     * 当弹窗关闭时，如果设置了该回调函数，则会调用它
     */
    closeCallback: () => void;

    /**
     * start方法在弹窗组件初始化时调用，用于设置弹窗的初始状态和事件监听
     * 该方法中初始化了弹窗的缩放动画，并为关闭按钮和遮罩层按钮添加了点击事件监听
     */
    start() {
        // 保存弹窗的初始缩放比例
        this._startScale = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);
        // 初始化弹窗的缩放状态，使其不可见
        this.node.scale = new Vec3(0, 0, 0);
        // 使用tween动画库，设置弹窗显示时的缩放动画效果
        tween(this.node)
            .to(0.2, { scale: this._startScale })
            .start();

        // 为关闭按钮添加点击事件监听，当按钮被点击时，调用close方法关闭弹窗
        this.closeBtn.node.on(Button.EventType.CLICK, () => {
            this.close();
        }, this);

        // 为遮罩层按钮添加点击事件监听，当按钮被点击时，同样调用close方法关闭弹窗
        this.maskBtn.node.on(Button.EventType.CLICK, () => {
            this.close();
        }, this);
    }

    /**
     * close方法用于关闭弹窗
     * 该方法会从父节点中移除弹窗，并在存在时调用关闭回调函数
     */
    close() {
        // 从父节点中移除弹窗节点，从而将其从场景中删除
        this.node.removeFromParent();
        if (this.closeCallback) {
            this.closeCallback();
        }
    }
}