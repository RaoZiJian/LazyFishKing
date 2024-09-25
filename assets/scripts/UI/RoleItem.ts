import { _decorator, Component, Label, Node, ProgressBar, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RoleItem')
export class RoleItem extends Component {

    @property(Sprite)
    avatarBg: Sprite

    @property(Sprite)
    avatar: Sprite

    @property(Sprite)
    progressBar: Sprite

    @property(Label)
    roleName: Label

    @property(Label)
    roleLevel: Label

    @property(Label)
    roleAttack: Label

    @property(Label)
    percent: Label

    @property(Label)
    coins: Label

    @property(ProgressBar)
    progress:ProgressBar

    start() {

    }

    update(deltaTime: number) {

    }
}


