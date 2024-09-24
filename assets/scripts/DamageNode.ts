import { _decorator, Component, director, Label, Node, tween, Vec3 } from 'cc';
import { ResPool } from './ResPool';
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
                const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
                this.node.position = new Vec3(0, this.node.position.y - 15, 0);
                this.node.removeFromParent();
                this.node.scale = new Vec3(1, 1, 1);
                resPool.putNode(this.node);
            })
            .start();
    }
}


