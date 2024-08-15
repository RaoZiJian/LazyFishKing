import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DamageNode')
export class DamageNode extends Component {

    @property(Label)
    label: Label;

    start() {
        this.node.scale = new Vec3(0, 0, 0);
    }

    update(deltaTime: number) {

    }

    playZoomIn() {
        tween(this.node)
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();

        tween(this.node)
            .by(0.2, { position: new Vec3(0, 15, 0) })
            .start();
    }

    playZoomOut() {
        tween(this.node)
            .to(0.2, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                this.node.removeFromParent();
            })
            .start();
    }
}


