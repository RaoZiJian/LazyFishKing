import { _decorator, Component, director, Node } from 'cc';
import { Mediator } from './Mediator';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { ResPool } from '../ResPool';
const { ccclass, property } = _decorator;

@ccclass('XuChuMediator')
export class XuChuMediator extends Mediator {
    onLoad() {
        this.actor = new Actor(LazyFishId.XuChu);
    }

    start(): void {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();

        const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
        resPool.loadBladeWindSkill();
    }

    update(deltaTime: number) {
        
    }
}


