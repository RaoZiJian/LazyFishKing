import { _decorator, Button, Component, Label, Node, NodeEventType, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopUp')
export class PopUp extends Component {

    @property(Label)
    title: Label;

    @property(Button)
    closeBtn: Button;

    @property(Button)
    maskBtn:Button;

    private _startScale: Vec3;

    closeCallback: () => void;

    start() {
        this._startScale = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);
        this.node.scale = new Vec3(0, 0, 0);
        tween(this.node)
            .to(0.2, { scale: this._startScale })
            .start();

        this.closeBtn.node.on(Button.EventType.CLICK, () => {
            this.close();
        }, this);

        this.maskBtn.node.on(Button.EventType.CLICK, () => {
            this.close();
        }, this);
    }

    close() {
        this.node.removeFromParent();
        if (this.closeCallback) {
            this.closeCallback();
        }
    }

    update(deltaTime: number) {

    }
}


