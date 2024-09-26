import { _decorator, Component, Label, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BagItem')
export class BagItem extends Component {

    @property(Sprite)
    icon: Sprite;

    @property(Label)
    amount: Label;

    start() {

    }

    update(deltaTime: number) {

    }
}


