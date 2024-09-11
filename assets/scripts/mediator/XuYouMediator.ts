import { _decorator, AudioClip, Component, Node, resources } from 'cc';
import { ShootingMediator } from './ShootingMediator';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
const { ccclass, property } = _decorator;

@ccclass('XuYouMediator')
export class XuYouMediator extends ShootingMediator {
    start() {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.actor = new Actor(LazyFishId.XuYou);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {
        
    }
}


