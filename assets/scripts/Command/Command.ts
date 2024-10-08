import { instantiate, Prefab, resources, Node, tween, Vec3, director, Animation, Label } from "cc";
import { Mediator } from "../mediator/Mediator";
import { StateMachine, States } from "../stateMachine/StateMachine";
import { Constants, RES_URL } from "../Constants";
import { DamageNode } from "../DamageNode";
import { MainSkillFactory } from "../Skill/MainSkillFactory";
import { MainSkill } from "../Skill/MainSkill";
import { BuffNode } from "../BuffNode";
import { ResPool } from "../ResPool";
import { BattleField } from "../BattleField";
import { Bullet } from "../Bullets/Bullet";
import { ShootingMediator } from "../mediator/ShootingMediator";
import { AttackType } from "../Actor/Actor";
import { ChestMediator } from "../mediator/ChestMediator";
import { AccountInfo } from "../AccountInfo";

export abstract class Command {

    private _isFinished: boolean = false;
    public get isFinished(): boolean {
        return this._isFinished;
    }
    public set isFinished(value: boolean) {
        this._isFinished = value;
    }

    private _duration: number;
    /**
     * 命令的持续时间
     */
    public get duration(): number {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }

    /**
     * 下一个命令
     */
    private _nextCommand: Command;
    public get nextCommand(): Command {
        return this._nextCommand;
    }
    public set nextCommand(value: Command) {
        this._nextCommand = value;
    }

    abstract execute(): void;

    complete(): void {
        this.isFinished = true;
        if (this.nextCommand) {
            this.nextCommand.execute();
        }
    }
}

export class EndTurnCoomand extends Command {

    private _callback: () => void;
    public get callback(): () => void {
        return this._callback;
    }
    public set callback(value: () => void) {
        this._callback = value;
    }

    constructor(e: () => void) {
        super();
        this.callback = e;
    }

    execute(): void {
        if (this.callback) {
            this.callback();
        }
    }
}

export class MoveCommand extends Command {

    private _target: Mediator;
    /**
     * 移动人物
     */
    public get target(): Mediator {
        return this._target;
    }
    public set target(value: Mediator) {
        this._target = value;
    }

    private _targetPos: Vec3;
    /**
     * 目标坐标，世界坐标
     */
    public get targetPos(): Vec3 {
        return this._targetPos;
    }
    public set targetPos(value: Vec3) {
        this._targetPos = value;
    }

    private _time: number;
    /**
     * 移动完成的时间
     */
    public get time(): number {
        return this._time;
    }
    public set time(value: number) {
        this._time = value;
    }

    constructor(target: Mediator, targetPos: Vec3, time: number) {
        super();
        this.target = target;
        this.targetPos = targetPos;
        this.time = time;
        this.duration = this.time;
    }

    execute(): void {
        this.target.changeState(States.WALKING);
        tween(this.target.node)
            .to(this.time, { worldPosition: this.targetPos })
            .call(() => {
                this.target.changeState(States.IDLE);
                this.complete();
            })
            .start();
    }
}

export class AttackCommand extends Command {

    private _attacker: Mediator;
    /**
     * 进攻方
     */
    public get attacker(): Mediator {
        return this._attacker;
    }
    public set attacker(value: Mediator) {
        this._attacker = value;
    }

    private _defender: Mediator;
    /**
     * 防御方
     */
    public get defender(): Mediator {
        return this._defender;
    }
    public set defender(value: Mediator) {
        this._defender = value;
    }

    private _damage: number;
    /**
     * 伤害，如果不传则使用默认公式计算伤害
     */
    public get damage(): number {
        return this._damage;
    }
    public set damage(value: number) {
        this._damage = value;
    }

    constructor(attacker: Mediator, denfender: Mediator, damage?: number) {
        super();
        this.attacker = attacker;
        this.defender = denfender;
        this.damage = damage;
        this.duration = this.attacker.stateMachine.getAnimationDuration(States.ATTACKING) * 0.5;
    }

    execute(): void {
        if (this.attacker.isAlive && this.defender.isAlive) {
            this.attacker.changeState(States.ATTACKING);
            const currentRage = this.attacker.getRage() + Constants.rageAdd;
            this.attacker.setRage(currentRage >= 100 ? 100 : currentRage);
            if (this.damage == undefined) {
                this.damage = this.attacker.actor.attack - this.defender.actor.denfence;
            }
            this.damage = this.damage > 0 ? this.damage : 1;
            const isDead = (this.defender.actor.hp - this.damage) <= 0;
            if (!isDead) {
                const hurtCommand = new HurtCommand(this.defender, this.damage);
                hurtCommand.nextCommand = this.nextCommand;
                this.nextCommand = hurtCommand;
            } else {
                const deadCommand = new DeadCommand(this.defender);
                deadCommand.nextCommand = this.nextCommand;
                this.nextCommand = deadCommand;
            }

            this.attacker.scheduleOnce(() => {
                this.complete();
            }, this.duration)
        } else {
            this.complete();
        }
    }
}

export class HurtCommand extends Command {

    private _target: Mediator;
    /**
     * 受击对象
     */
    public get target(): Mediator {
        return this._target;
    }
    public set target(value: Mediator) {
        this._target = value;
    }

    private _damage: number;
    /**
     * 伤害
     */
    public get damage(): number {
        return this._damage;
    }
    public set damage(value: number) {
        this._damage = value;
    }

    constructor(target: Mediator, damage: number) {
        super();
        this.target = target;
        this.damage = damage;
        if (target.actor.cfg.attackType == AttackType.Chest) {
            this.duration = Constants.chestHurtDuration;
        } else {
            this.duration = this.target.stateMachine.getAnimationDuration(States.HURT);
        }
    }

    execute(): void {
        if (this.target.isAlive) {
            this.target.changeState(States.HURT);
            const currentHp = this.target.actor.hp - this.damage;
            this.target.setHp(currentHp > 0 ? currentHp : 0);
            const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
            const damageNode = resPool.getDamageNode();
            if (damageNode) {
                this.target.node.addChild(damageNode);
                const damageComponent = damageNode.getComponent(DamageNode);
                damageComponent.label.string = this.damage.toString();
                damageComponent.playZoomIn();
                this.target.scheduleOnce(() => {
                    damageComponent.playZoomOut();
                }, this.duration)
            }
        }

        this.complete();
    }
}

export class DeadCommand extends Command {

    private _target: Mediator;
    /**
     * 死亡目标
     */
    public get target(): Mediator {
        return this._target;
    }
    public set target(value: Mediator) {
        this._target = value;
    }

    constructor(target: Mediator) {
        super();
        this.target = target;
        if (target.actor.cfg.attackType == AttackType.Chest) {
            let mediator = this.target as ChestMediator;
            this.duration = mediator.getDyingDuration();
        } else {
            this.duration = this.target.stateMachine.getAnimationDuration(States.DYING);
        }
    }

    execute(): void {
        if (this.target.isAlive) {
            this.target.changeState(States.DYING);
            const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
            const battleField = director.getScene().getChildByName("Canvas").getComponentInChildren(BattleField);
            let isActorFromLeft = battleField.isActorFromLeft(this.target);
            if (!isActorFromLeft) {
                let dropId = this.target.actor.cfg.drop;
                let dropAmount = this.target.actor.cfg.dropAmount;
                AccountInfo.getInstance().addItem(dropId, dropAmount);
            }
            const damageNode = resPool.getDamageNode();
            if (damageNode) {
                this.target.node.addChild(damageNode);

                const damageComponent = damageNode.getComponent(DamageNode);
                damageComponent.label.string = this.target.getHp().toString();
                this.target.setHp(0);
                damageComponent.playZoomIn();

                this.target.scheduleOnce(() => {
                    this.target.node.removeFromParent();
                }, this.duration * 0.5);

                this.target.scheduleOnce(() => {
                    damageComponent.playZoomOut();
                }, this.duration * 0.5 > 0.2 ? this.duration * 0.5 : 0.3);
            }
        }

        this.complete();
    }
}

export class ShootingCommand extends Command {

    private _attacker: Mediator;
    public get attacker(): Mediator {
        return this._attacker;
    }
    public set attacker(value: Mediator) {
        this._attacker = value;
    }

    private _defender: Mediator;
    public get defender(): Mediator {
        return this._defender;
    }
    public set defender(value: Mediator) {
        this._defender = value;
    }


    constructor(attacker: Mediator, defender: Mediator) {
        super();
        this.attacker = attacker;
        this.defender = defender;
        this.duration = this.attacker.stateMachine.getAnimationDuration(States.SHOOTING);
    }

    execute(): void {
        if (this.attacker.isAlive && this.defender.isAlive) {
            this.attacker.changeState(States.SHOOTING);
            this.attacker.scheduleOnce(() => {
                this.complete();
            }, this.duration);
        }
    }
}

export class BulletFireCommnad extends Command {

    private _bullet: Node;
    public get bullet(): Node {
        return this._bullet;
    }
    public set bullet(value: Node) {
        this._bullet = value;
    }

    private _attacker: Mediator;
    public get attacker(): Mediator {
        return this._attacker;
    }
    public set attacker(value: Mediator) {
        this._attacker = value;
    }

    private _target: Mediator;
    public get target(): Mediator {
        return this._target;
    }
    public set target(value: Mediator) {
        this._target = value;
    }

    private _damage: number;
    public get damage(): number {
        return this._damage;
    }
    public set damage(value: number) {
        this._damage = value;
    }

    constructor(bullet: Node, attacker: Mediator, target: Mediator, duration: number, damage?: number) {
        super();
        this.bullet = bullet;
        this.attacker = attacker;
        this.target = target;
        this.damage = damage;
        this.duration = duration;
    }

    execute(): void {
        if (this.target && this.target.isAlive) {
            const effectLayer = director.getScene().getChildByName("Canvas").getChildByName('EffectLayer');
            effectLayer.addChild(this.bullet);
            const shootingMediator = this.attacker.getComponent(ShootingMediator);
            this.bullet.worldPosition = shootingMediator.arrow.worldPosition;
            const bulletComponent = this.bullet.getComponent(Bullet);
            shootingMediator.changeState(States.IDLE);
            bulletComponent.fire(this.target, this.duration - 0.1, this.attacker.isReverse, () => {
                this.bullet.removeFromParent();
                this.attacker.changeState(States.IDLE);

                if (this.damage == undefined) {
                    this.damage = this.attacker.actor.attack - this.target.actor.denfence;
                }
                this.damage = this.damage > 0 ? this.damage : 1;
                const currentRage: number = this.attacker.getRage() + Constants.rageAdd;
                this.attacker.setRage(currentRage >= 100 ? 100 : currentRage);
                const isDead = (this.target.actor.hp - this.damage) <= 0;
                if (!isDead) {
                    const hurtCommand = new HurtCommand(this.target, this.damage);
                    hurtCommand.execute();
                } else {
                    const deadCommand = new DeadCommand(this.target);
                    deadCommand.execute();
                }
                const explosion = new BulletFireExplosion(this.target);
                explosion.execute();
                this.complete();
            })
        } else {
            this.attacker.changeState(States.IDLE);
            this.complete();
        }
    }
}

export class BulletFireExplosion extends Command {

    private _target: Mediator;
    public get target(): Mediator {
        return this._target;
    }
    public set target(value: Mediator) {
        this._target = value;
    }

    private _explosionNode: Node;
    public get explosionNode(): Node {
        return this._explosionNode;
    }
    public set explosionNode(value: Node) {
        this._explosionNode = value;
    }

    constructor(target: Mediator) {
        super();
        const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
        const explosionNode = resPool.getExplosionNode();
        this.explosionNode = explosionNode;
        this.target = target;
        this.duration = this.explosionNode.getComponent(Animation).defaultClip.duration;
    }

    execute(): void {
        const animation = this.explosionNode.getComponent(Animation);
        this.target.model.addChild(this.explosionNode);
        if (animation) {
            animation.play();
            this.target.scheduleOnce(() => {
                const resPool = director.getScene().getChildByName("Canvas").getComponent(ResPool);
                resPool.putNode(this.explosionNode);
                this.explosionNode.removeFromParent();
                this.complete();
            }, this.duration)
        }
    }
}

export class MainSkillCastCommand extends Command {

    private _caster: Mediator;
    public get caster(): Mediator {
        return this._caster;
    }
    public set caster(value: Mediator) {
        this._caster = value;
    }

    private _defenders: Mediator[];
    public get defenders(): Mediator[] {
        return this._defenders;
    }
    public set defenders(value: Mediator[]) {
        this._defenders = value;
    }

    private _mainSkill: MainSkill;
    public get mainSkill(): MainSkill {
        return this._mainSkill;
    }
    public set mainSkill(value: MainSkill) {
        this._mainSkill = value;
    }

    constructor(caster: Mediator, denfenders: Mediator[], skillId: number, battleField: BattleField) {
        super();
        this.caster = caster;
        this.defenders = denfenders;
        this.mainSkill = MainSkillFactory.createMainSkill(skillId, caster, denfenders, battleField);
        if (this.mainSkill) {
            this.duration = this.mainSkill.duration;
        }
    }

    getMoveTarget(): Mediator {
        return this.mainSkill.getMoveTarget();
    }

    execute(): void {
        if (this.mainSkill) {
            this.caster.changeState(States.CASTING);
            const currentRage = this.caster.getRage() - this.mainSkill.cfg.rageCost;
            this.caster.setRage(currentRage <= 0 ? 0 : currentRage);
            this.mainSkill.cast();
            this.caster.scheduleOnce(() => {
                this.caster.changeState(States.IDLE);
                this.complete();
            }, this.duration)
        } else {
            this.complete();
        }
    }

}