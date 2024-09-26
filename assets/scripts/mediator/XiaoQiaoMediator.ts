import { _decorator, Component, Node } from 'cc';
import { ShootingMediator } from './ShootingMediator';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
const { ccclass, property } = _decorator;

@ccclass('XiaoQiaoMediator')
export class XiaoQiaoMediator extends ShootingMediator {

    onLoad() {
        this.actor = new Actor(LazyFishId.XiaoQiao);
    }

    start(): void {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {

    }
}


