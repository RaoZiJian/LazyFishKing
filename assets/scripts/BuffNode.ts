import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BuffNode')
export class BuffNode extends Component {

    @property(Label)
    label: Label;

    start() {

    }

    update(deltaTime: number) {

    }
}


