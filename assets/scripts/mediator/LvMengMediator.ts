import { _decorator, Component, Node } from 'cc';
import { Mediator } from './Mediator';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
const { ccclass, property } = _decorator;

@ccclass('LvMengMediator')
export class LvMengMediator extends Mediator {
    start() {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.actor = new Actor(LazyFishId.LvMeng);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {

    }
}


