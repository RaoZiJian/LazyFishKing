import { _decorator, Component, Enum, Node, Skeleton, sp } from 'cc';
import { Mediator } from './Mediator';
import { Constants, LazyFishId } from '../Constants';
import { States } from '../stateMachine/StateMachine';
import { Actor } from '../Actor/Actor';
const { ccclass, property } = _decorator;

@ccclass('ChestMediator')
export class ChestMediator extends Mediator {

    @property({ type: Enum(LazyFishId) })
    actorId

    @property(sp.Skeleton)
    skeleton: sp.Skeleton

    private ANIMATION_IDLE = ["Wait_0", "Wait_1", "Wait_2"]
    private ANIMTION_OPEN = ["Open_0", "Open_1", "Open_2"]
    private ANIMTION_OPEN_IDLE = ["OpenWait_0", "OpenWait_1", "OpenWait_2"]

    start() {
        this.actor = new Actor(this.actorId);
        this.playIdle();
    }

    changeState(newState: string) {
        if (newState == States.DYING) {
            this.playOpen();
            this.isAlive = false;
        }
    }

    private _getAnimationIndex(): number {
        switch (this.actorId) {
            case LazyFishId.ChestSmall:
                return 0
            case LazyFishId.ChestMiddle:
                return 1;
            case LazyFishId.ChestLarge:
                return 2;
            default:
                return -1;
        }
    }

    getDyingDuration(): number {
        const animationIndex = this._getAnimationIndex();
        if (animationIndex >= 0) {
            return this.skeleton.findAnimation(this.ANIMTION_OPEN[animationIndex]).duration;
        }

        return Constants.chestHurtDuration;
    }

    playIdle() {
        const animationIndex = this._getAnimationIndex();
        if (animationIndex >= 0) {
            this.skeleton.setAnimation(0, this.ANIMATION_IDLE[animationIndex], true);
        }
    }

    playOpen() {
        this.skeleton.setEndListener((trackEntry) => {
            this.playOpenIde();
        })

        const animationIndex = this._getAnimationIndex();
        if (animationIndex >= 0) {
            this.skeleton.setAnimation(0, this.ANIMTION_OPEN[animationIndex], false);
        }
    }

    playOpenIde() {
        const animationIndex = this._getAnimationIndex();
        if (animationIndex >= 0) {
            this.skeleton.setAnimation(0, this.ANIMTION_OPEN_IDLE[animationIndex], true);
        }
    }


    update(deltaTime: number) {

    }
}


