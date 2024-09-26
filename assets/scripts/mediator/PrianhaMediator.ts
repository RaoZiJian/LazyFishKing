import { _decorator } from 'cc';
import { Mediator } from './Mediator';
import { LazyFishId } from '../Constants';
import { Actor } from '../Actor/Actor';
import { StateMachine, States } from '../stateMachine/StateMachine';
const { ccclass, property } = _decorator;

@ccclass('PrianhaMediator')
export class PrianhaMediator extends Mediator {

    onLoad() {
        this.actor = new Actor(LazyFishId.Prianha);
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


