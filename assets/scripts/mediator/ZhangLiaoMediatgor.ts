import { _decorator, Component, Node } from 'cc';
import { Mediator } from './Mediator';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
const { ccclass, property } = _decorator;

@ccclass('ZhangLiaoMediatgor')
export class ZhangLiaoMediatgor extends Mediator {
    start() {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.actor = new Actor(LazyFishId.ZhangLiao);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {

    }
}


