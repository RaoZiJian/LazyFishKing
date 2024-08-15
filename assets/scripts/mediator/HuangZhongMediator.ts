import { _decorator, Component, instantiate, Node, Prefab, resources, UIOpacity, Vec3 } from 'cc';
import { Mediator } from './Mediator';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { ShootingMediator } from './ShootingMediator';
import { Bullet } from '../Bullet';
const { ccclass, property } = _decorator;

@ccclass('HuangZhongMediator')
export class HuangZhongMediator extends ShootingMediator {

    start() {
        this.stateMachine = this.getComponentInChildren(StateMachine);
        this.changeState(States.IDLE);
        this.actor = new Actor(LazyFishId.HuangZhong);
        this.initRage();
        this.loadAudioRes();
        this.addInitialBuff();
    }

    update(deltaTime: number) {

    }
}


