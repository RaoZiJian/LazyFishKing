import { _decorator, Component, Animation, log } from 'cc';
const { ccclass, property } = _decorator;

export const States = {
    IDLE: 'idle',
    WALKING: 'walking',
    ATTACKING: 'attacking',
    SHOOTING: 'shooting',
    HEALING: 'healing',
    CASTING: 'casting',
    HURT: 'hurt',
    DYING: 'dying',
    EMPTY: 'empty'
}

@ccclass('StateMachine')
export class StateMachine extends Component {

    @property(Animation)
    animation: Animation = null;

    /**
     * 当前状态
     */
    private _currentState: string = States.EMPTY;
    public get currentState(): string {
        return this._currentState;
    }
    public set currentState(value: string) {
        this._currentState = value;
    }

    changeState(newState: string) {
        if (this.currentState != newState) {
            this.currentState = newState;
            if (this.currentState != States.CASTING) {
                this.playAnimationByState();
            }
        }
    }

    playAnimationByState() {
        const clips = this.animation.clips;
        const ani = clips.filter(clip => clip.name == this.currentState)
        if (ani.length > 0) {
            this.animation.play(this.currentState);
        } else {
            log("No this state animation " + this.currentState);
        }
    }

    /**
     * 
     * @param state 
     * @returns -1:no duration
     */
    getAnimationDuration(state: string): number {
        const clips = this.animation.clips;
        const ani = clips.filter(clip => clip.name == state);
        if (ani.length > 0) {
            return ani[0].duration;
        } else {
            log("cannot find state " + state);
            return -1;
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


