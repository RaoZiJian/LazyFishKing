import { BuffNode } from "../BuffNode";
import { Bullet } from "../Bullets/Bullet";
import { DeadCommand, HurtCommand } from "../Command/Command";
import { Constants, RES_URL } from "../Constants";
import GameTsCfg from "../data/client/GameTsCfg";
import { Mediator } from "../mediator/Mediator";
import { ResPool } from "../ResPool";
import { States } from "../stateMachine/StateMachine";
import { Utils } from "../Utils";
import { Buff } from "./Buff";
import { Animation, tween, Vec3, Node, director, AudioClip, resources } from 'cc';

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

    private _resPool: ResPool;
    public get resPool(): ResPool {
        return this._resPool;
    }
    public set resPool(value: ResPool) {
        this._resPool = value;
    }

    private _canvas: Node;
    public get canvas(): Node {
        return this._canvas;
    }
    public set canvas(value: Node) {
        this._canvas = value;
    }

    constructor(id: number, caster: Mediator, targets: Mediator[]) {
        this.skillId = id;
        this.caster = caster;
        this.targets = targets;
        this.canvas = director.getScene().getChildByName("Canvas");
        this.resPool = this.canvas.getComponent(ResPool);

        if (GameTsCfg.MainSkill[this.skillId]) {
            this.cfg = GameTsCfg.MainSkill[this.skillId];
        }
    }


    abstract getMoveTarget(): Mediator;

    abstract cast();
}

export class SingleTauntSkill extends MainSkill {
    private TAUNT_ANIMATION_NAME = "taunt";
    private TAUNT_DISPLAY_TIME = 1;

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
        this.duration = tauntAnimation[0].duration + this.TAUNT_DISPLAY_TIME;
    }

    cast() {
        const buffs = Utils.parseString(this.cfg?.buffs) as number[];
        this.targets = [this.caster];
        let tauntValue = 0
        if (buffs && buffs[0]) {
            const buff = new Buff(buffs[0]);
            buff.work(this.targets);
            tauntValue = GameTsCfg.Effect[buff.effects[0].id].propertyValue
            this.animation.play(this.TAUNT_ANIMATION_NAME);
            this.caster.audio.playOneShot(this.caster.buffAudios.get(buff.id));
        }

        const buffNode = this.resPool.getBuffNode();

        if (buffNode) {
            const buffComponent = buffNode.getComponent(BuffNode);
            buffComponent.label.string = "嘲讽 + " + tauntValue;
            this.caster.node.addChild(buffNode);
            this.caster.scheduleOnce(() => {
                this.resPool.putNode(buffNode);
                buffNode.removeFromParent();
            }, this.duration)
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
                        this.caster.audio.playOneShot(this.caster.hurtAudioClip);

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

export class HealingGroupSkill extends MainSkill {
    private HEALING_ANIMATION_NAME = "healing";
    private HEALING_BUFF_DISPLAY_TIME = 0.5;

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
        const animation = this.animation.clips.filter(clip => clip.name == this.HEALING_ANIMATION_NAME);
        this.duration = animation[0].duration + this.HEALING_BUFF_DISPLAY_TIME;
    }

    cast() {
        const buffs = Utils.parseString(this.cfg?.buffs) as number[];
        let healingValue = 0
        if (buffs && buffs[0]) {
            const buff = new Buff(buffs[0]);
            buff.work(this.targets);
            healingValue = GameTsCfg.Effect[buff.effects[0].id].propertyValue
            this.animation.play(this.HEALING_ANIMATION_NAME);
            this.caster.audio.playOneShot(this.caster.buffAudios.get(buff.id));
        }

        const resPool = this.resPool.getComponent(ResPool);
        this.targets.forEach(target => {
            const buffNode = resPool.getBuffNode();
            if (buffNode) {
                const buffComponent = buffNode.getComponent(BuffNode);
                buffComponent.label.string = "HP + " + healingValue;
                target.node.addChild(buffNode);
                target.scheduleOnce(() => {
                    resPool.putNode(buffNode);
                    buffNode.removeFromParent();
                }, this.duration)
            }
        });
    }

    getMoveTarget(): Mediator {
        return this.targets[0];
    }
}

/**
 * 审时度势，对随机3名敌人造成200%攻击伤害，并且恢复自身造成伤害的40%的等量生命
 */
export class WindMagicSkill extends MainSkill {

    private CAST_BEGIN = "castBegin";
    private CAST_END = "castEnd";
    private WIND_AUDIO = "wind"

    private _castBeginDuration: number = 0;
    public get castBeginDuration(): number {
        return this._castBeginDuration;
    }
    public set castBeginDuration(value: number) {
        this._castBeginDuration = value;
    }

    private _castEndDuration: number = 0;
    public get castEndDuration(): number {
        return this._castEndDuration;
    }
    public set castEndDuration(value: number) {
        this._castEndDuration = value;
    }

    private _windMagicDuration: number = 0;
    public get windMagicDuration(): number {
        return this._windMagicDuration;
    }
    public set windMagicDuration(value: number) {
        this._windMagicDuration = value;
    }

    private _animation: Animation;
    public get animation(): Animation {
        return this._animation;
    }
    public set animation(value: Animation) {
        this._animation = value;
    }

    constructor(id: number, caster: Mediator, targets: Mediator[]) {
        let realTargets = Utils.getAliveActors(targets);
        super(id, caster, realTargets);
        this.animation = this.caster.model.getComponent(Animation);
        this.castBeginDuration = this.animation.clips.filter(clip => clip.name == this.CAST_BEGIN)[0].duration;
        this.castEndDuration = this.animation.clips.filter(clip => clip.name == this.CAST_END)[0].duration;
        const windMagicNode = this.resPool.getWindMagicNode();
        this.windMagicDuration = windMagicNode.getComponent(Animation).defaultClip.duration;

        this.duration = this.castBeginDuration + this.windMagicDuration + this.castEndDuration;
    }

    getMoveTarget(): Mediator {
        return this.targets[0];
    }

    getDamage(attacker: Mediator, defender: Mediator) {
        return attacker.actor.attack * 2 - defender.actor.denfence;
    }

    cast() {
        if (this.caster && this.caster.isAlive) {
            const realTargets = Utils.getRandomActors(Utils.getAliveActors(this.targets), 3);
            if (realTargets && realTargets.length > 0) {
                this.animation.play(this.CAST_BEGIN);
                this.caster.audio.playOneShot(this.caster.skillAudioMap.get(this.WIND_AUDIO));
                let totalDamage = 0;
                this.caster.scheduleOnce(() => {
                    realTargets.forEach(target => {
                        const windMagicNode = this.resPool.getWindMagicNode();
                        this.canvas.getChildByName("EffectLayer").addChild(windMagicNode);
                        windMagicNode.worldPosition = target.node.worldPosition;
                        const windMagicAnimation = windMagicNode.getComponent(Animation);
                        windMagicAnimation.play();

                        let damage = this.getDamage(this.caster, target);
                        damage = damage > 0 ? damage : 1;
                        const isDead = (target.actor.hp - damage) <= 0;
                        if (!isDead) {
                            const hurtCommand = new HurtCommand(target, damage);
                            target.scheduleOnce(() => {
                                hurtCommand.execute();
                            }, this.windMagicDuration * 0.5)
                        } else {
                            const deadCommand = new DeadCommand(target);
                            target.scheduleOnce(() => {
                                deadCommand.execute();
                            }, this.windMagicDuration * 0.5)
                        }
                        totalDamage += damage;
                        windMagicAnimation.scheduleOnce(() => {
                            windMagicNode.removeFromParent();
                            this.resPool.putNode(windMagicNode);
                        }, this.windMagicDuration)
                    })
                }, this.castBeginDuration)

                this.caster.scheduleOnce(() => {
                    let healingValue = totalDamage * 0.4;
                    let currentHp = this.caster.actor.hp + healingValue;
                    currentHp = currentHp > this.caster.actor.cfg.hp ? this.caster.actor.cfg.hp : currentHp;
                    this.caster.setHp(currentHp);
                    this.animation.play(this.CAST_END);
                }, this.castBeginDuration + this.windMagicDuration);
            }
        }
    }
}

/**
 * 虎痴撼地，对随机2名第二年造成300%伤害
 */
export class BladeWindSkill extends MainSkill {

    private HEAVY_ATTACK_AUDIO = "boyHeavyHit1"
    private BLADE_SLASHING_AUDIO = "bladeSlashing"

    private SLASHING = "slashing"

    private _animation: Animation;
    public get animation(): Animation {
        return this._animation;
    }
    public set animation(value: Animation) {
        this._animation = value;
    }

    private _slashingDuration: number;
    public get slashingDuration(): number {
        return this._slashingDuration;
    }
    public set slashingDuration(value: number) {
        this._slashingDuration = value;
    }

    private _bladeWindDuration: number;
    public get bladeWindDuration(): number {
        return this._bladeWindDuration;
    }
    public set bladeWindDuration(value: number) {
        this._bladeWindDuration = value;
    }

    constructor(id: number, caster: Mediator, targets: Mediator[]) {
        const realTargets = Utils.getRandomActors(Utils.getAliveActors(targets), 2);
        super(id, caster, realTargets);

        this.animation = this.caster.model.getComponent(Animation);
        this.slashingDuration = this.animation.clips.filter(clip => clip.name == this.SLASHING)[0].duration;
        const bladeWind1 = this.resPool.getBladeWindNode(0).getComponent(Bullet);
        const bladeWind2 = this.resPool.getBladeWindNode(1).getComponent(Bullet);
        this.bladeWindDuration = Math.max(bladeWind1.bullet.getComponent(Animation).defaultClip.duration, bladeWind2.bullet.getComponent(Animation).defaultClip.duration);
        this.duration = this.slashingDuration + Constants.bladeWindFlyDuration + this.bladeWindDuration;
    }

    getMoveTarget(): Mediator {
        return this.targets[0];
    }

    getDamage(attacker: Mediator, defender: Mediator) {
        return attacker.actor.attack * 3 - defender.actor.denfence;
    }

    cast() {
        if (this.caster && this.caster.isAlive) {
            const aliveTargets = Utils.getAliveActors(this.targets);
            if (aliveTargets && aliveTargets.length < 2) {
                this.targets = Utils.getRandomActors(Utils.getAliveActors(this.targets), 2);
            }
            if (this.targets && this.targets.length > 0) {
                this.targets = this.targets;
                this.animation.play(this.SLASHING);
                this.caster.audio.playOneShot(this.caster.skillAudioMap.get(this.HEAVY_ATTACK_AUDIO));
                this.caster.audio.playOneShot(this.caster.skillAudioMap.get(this.BLADE_SLASHING_AUDIO));
                this.caster.scheduleOnce(() => {
                    for (let i = 0; i < this.targets.length; i++) {
                        const target = this.targets[i];
                        const bladeWind = this.resPool.getBladeWindNode(i);
                        this.canvas.getChildByName("EffectLayer").addChild(bladeWind);
                        bladeWind.worldPosition = this.caster.model.worldPosition;
                        const bladeBullet = bladeWind.getComponent(Bullet);
                        bladeBullet.bullet.getComponent(Animation).play();
                        if (this.caster.isReverse == -1) {
                            bladeBullet.bullet.scale = new Vec3(bladeBullet.bullet.scale.x * -1, bladeBullet.bullet.scale.y, bladeBullet.bullet.scale.z);
                        }
                        tween(bladeWind)
                            .to(this.bladeWindDuration, { worldPosition: target.model.worldPosition })
                            .call(() => {
                                let damage = this.getDamage(this.caster, target);
                                damage = damage > 0 ? damage : 1;
                                const isDead = (target.actor.hp - damage) <= 0;
                                bladeBullet.scheduleOnce(() => {
                                    bladeBullet.bullet.scale = new Vec3(0.5, 0.5, 0.5);
                                    bladeWind.removeFromParent();
                                    this.resPool.putNode(bladeWind);
                                }, this.bladeWindDuration)
                                if (!isDead) {
                                    const hurtCommand = new HurtCommand(target, damage);
                                    hurtCommand.execute();
                                } else {
                                    const deadCommand = new DeadCommand(target);
                                    deadCommand.execute();
                                }
                            })
                            .start();
                    }
                }, this.slashingDuration)
            }
        }
    }

}