import { _decorator, Component, Node } from 'cc';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { Mediator } from './Mediator';
const { ccclass, property } = _decorator;

@ccclass('OctopusMediator')
export class OctopusMediator extends Mediator {
    start() {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.actor = new Actor(LazyFishId.Octopus);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {
        
    }
}


