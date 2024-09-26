import { _decorator, Component, instantiate, Node, Prefab, resources, UIOpacity, Vec3 } from 'cc';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { ShootingMediator } from './ShootingMediator';
const { ccclass } = _decorator;

@ccclass('HuangZhongMediator')
export class HuangZhongMediator extends ShootingMediator {

    onLoad() {
        this.actor = new Actor(LazyFishId.HuangZhong);
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


