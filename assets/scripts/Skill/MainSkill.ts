import { BuffNode } from "../BuffNode";
import { DeadCommand, HurtCommand } from "../Command/Command";
import GameTsCfg from "../data/client/GameTsCfg";
import { Mediator } from "../mediator/Mediator";
import { ResPool } from "../ResPool";
import { States } from "../stateMachine/StateMachine";
import { Utils } from "../Utils";
import { Buff } from "./Buff";
import { Animation, tween, Vec3, Node, director } from 'cc';

export abstract class MainSkill {

    private _skillId: number;
    public get skillId(): number {
        return this._skillId;
    }
    public set skillId(value: number) {
        this._skillId = value;
    }

    private _cfg;
    public get cfg() {
        return this._cfg;
    }
    public set cfg(value) {
        this._cfg = value;
    }

    private _duration: number;
    public get duration(): number {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }

    private _caster: Mediator;
    public get caster(): Mediator {
        return this._caster;
    }
    public set caster(value: Mediator) {
        this._caster = value;
    }
    private _targets: Mediator[];
    public get targets(): Mediator[] {
        return this._targets;
    }
    public set targets(value: Mediator[]) {
        this._targets = value;
    }

    constructor(id: number, caster: Mediator, targets: Mediator[]) {
        this.skillId = id;
        this.caster = caster;
        this.targets = targets;

        if (GameTsCfg.MainSkill[this.skillId]) {
            this.cfg = GameTsCfg.MainSkill[this.skillId];
        }
    }


    abstract getMoveTarget(): Mediator;

    abstract cast();
}

export class SingleTauntSkill extends MainSkill {
    private TAUNT_ANIMATION_NAME = "taunt";

    private _animation: Animation;
    public get animation(): Animation {
        return this._animation;
    }
    public set animation(value: Animation) {
        this._animation = value;
    }

    constructor(id: number, caster: Mediator, targets: Mediator[]) {
        super(id, caster, targets);
        this.animation = this.caster.model.getComponent(Animation);
        const tauntAnimation = this.animation.clips.filter(clip => clip.name == this.TAUNT_ANIMATION_NAME);
        this.duration = tauntAnimation[0].duration;
    }

    cast() {
        const buffs = Utils.parseString(this.cfg?.buffs) as number[];
        this.targets = [this.caster];
        let tauntValue = 0
        if (buffs && buffs[0]) {
            const buff = new Buff(buffs[0]);
            buff.work(this.targets);
            tauntValue = GameTsCfg.Effect[buff.effects[0].id].propertyValue
        }
        this.animation.play(this.TAUNT_ANIMATION_NAME);
        this.caster.audio.playOneShot(this.caster.buffAudioClip);

        const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
        const buffNode = resPool.getBuffNode();

        if (buffNode) {
            const buffComponent = buffNode.getComponent(BuffNode);
            buffComponent.label.string = "嘲讽 + " + tauntValue;
            this.caster.node.addChild(buffNode);
            this.caster.scheduleOnce(() => {
                resPool.putNode(buffNode);
                buffNode.removeFromParent();
            }, this.duration + 0.5)
        }

    }

    getMoveTarget(): Mediator {
        return this.targets[0];
    }
}

export class JumpAttackSkill extends MainSkill {

    private JUMP_START = "jumpStart";
    private JUMP_LOOP = "jumpLoop";
    private ATTACKING = "attacking";
    private JUMP_LOOP_TIME = 0.5;

    private _animation: Animation;
    public get animation(): Animation {
        return this._animation;
    }
    public set animation(value: Animation) {
        this._animation = value;
    }

    private _defender: Mediator;
    public get defender(): Mediator {
        return this._defender;
    }
    public set defender(value: Mediator) {
        this._defender = value;
    }

    private _jumpStartDuration: number = 0;
    private _jumpLoopDuration: number = 0;
    private _attackingDuration: number = 0;

    constructor(id: number, caster: Mediator, targets: Mediator[]) {
        super(id, caster, targets);
        this.animation = this.caster.model.getComponent(Animation);
        this._jumpStartDuration = this.animation.clips.filter(clip => clip.name == this.JUMP_START)[0].duration;
        this._jumpLoopDuration = this.animation.clips.filter(clip => clip.name == this.JUMP_LOOP)[0].duration;
        this._attackingDuration = this.animation.clips.filter(clip => clip.name == this.ATTACKING)[0].duration;

        this.duration = this._jumpStartDuration + this._jumpLoopDuration + this._attackingDuration;
        this.defender = this.getMoveTarget();
    }

    getMoveTarget(): Mediator {
        const sortedTargets = this.targets.sort((a, b) => {
            return b.actor.taunt - a.actor.taunt;
        })

        return sortedTargets[0];
    }

    getDamage(defender: Mediator) {
        return this.caster.actor.attack * 3 - defender.actor.denfence;
    }

    cast() {
        if (this.caster && this.caster.isAlive) {
            this.caster.changeState(States.CASTING);
            if (this.defender && this.defender.isAlive) {
                this.animation.play(this.JUMP_START);

                this.caster.scheduleOnce(() => {
                    this.animation.play(this.JUMP_LOOP);
                    const offsetY = 15;
                    const offsetX = 15 * this.caster.isReverse;

                    tween(this.caster.node)
                        .by(this.JUMP_LOOP_TIME / 2, { position: new Vec3(offsetX / 2, offsetY, 0) })
                        .by(this.JUMP_LOOP_TIME / 2, { position: new Vec3(offsetX / 2, -offsetY, 0) })
                        .start();

                    this.caster.scheduleOnce(() => {
                        this.animation.play(this.ATTACKING);
                        this.caster.audio.playOneShot(this.caster.attackAudioClip);

                        let damage = this.getDamage(this.defender);
                        damage = damage > 0 ? damage : 1;
                        const isDead = (this.defender.actor.hp - damage) <= 0;
                        if (!isDead) {
                            const hurtCommand = new HurtCommand(this.defender, damage);
                            this.defender.scheduleOnce(() => {
                                hurtCommand.execute();
                            }, this._jumpLoopDuration * 0.5)
                        } else {
                            const deadCommand = new DeadCommand(this.defender);
                            this.defender.scheduleOnce(() => {
                                deadCommand.execute();
                            }, this._jumpLoopDuration * 0.5)
                        }


                    }, this.JUMP_LOOP_TIME);

                }, this._jumpStartDuration)
            }
        }
    }

}