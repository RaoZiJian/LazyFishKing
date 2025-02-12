import { _decorator, Component, Node } from 'cc';
import { Mediator } from './Mediator';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
const { ccclass, property } = _decorator;

@ccclass('ZhaoYunMediator')
export class ZhaoYunMediator extends Mediator {
    onLoad() {
        // this.actor = new Actor(LazyFishId.ZhangLiao);
    }

    start(): void {

    }

    update(deltaTime: number) {
        
    }
}


