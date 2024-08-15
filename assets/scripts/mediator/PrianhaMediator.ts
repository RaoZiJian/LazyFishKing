import { _decorator } from 'cc';
import { Mediator } from './Mediator';
import { LazyFishId } from '../Constants';
import { Actor } from '../Actor/Actor';
import { StateMachine, States } from '../stateMachine/StateMachine';
const { ccclass, property } = _decorator;

@ccclass('PrianhaMediator')
export class PrianhaMediator extends Mediator {

    start() {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.actor = new Actor(LazyFishId.Prianha);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {

    }
}


