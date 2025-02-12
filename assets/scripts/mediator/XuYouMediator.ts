import { _decorator, AudioClip, Component, director, Node, resources } from 'cc';
import { ShootingMediator } from './ShootingMediator';
import { Actor } from '../Actor/Actor';
import { LazyFishId } from '../Constants';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { ResPool } from '../ResPool';
const { ccclass, property } = _decorator;

@ccclass('XuYouMediator')
export class XuYouMediator extends ShootingMediator {
    onLoad() {
        // this.actor = new Actor(LazyFishId.XuYou);
    }

    loadingActor(actor: Actor): void {
        super.loadingActor(actor);
        const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
        resPool.loadWindMagicSkill();
    }

    start(): void {

    }

    update(deltaTime: number) {
        
    }
}


