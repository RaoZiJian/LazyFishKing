import { Node, tween, Vec3, director, Animation } from "cc";
import { Mediator } from "../mediator/Mediator";
import { States } from "../stateMachine/StateMachine";
import { Constants } from "../Constants";
import { DamageNode } from "../DamageNode";
import { MainSkillFactory } from "../Skill/MainSkillFactory";
import { MainSkill } from "../Skill/MainSkill";
import { PoolType, ResPool } from "../ResPool";
import { BattleField } from "../BattleField";
import { Bullet } from "../Bullets/Bullet";
import { ShootingMediator } from "../mediator/ShootingMediator";
import { AttackType } from "../Actor/Actor";
import { ChestMediator } from "../mediator/ChestMediator";
import { AccountInfo } from "../AccountInfo";

export abstract class Command {

    /**
     * 是否执行完成
     */
    isFinished: boolean = false;

    /**
     * 持续时间
     */
    duration: number;

    /**
     * 下一个命令节点
     */
    nextCommand: Command;

    /**
     * 执行命令
     */
    abstract execute(): Promise<void>;

    /**
     * 命令完成放大，调用下一个命令
     */
    async complete(): Promise<void> {
        this.isFinished = true;
        if (this.nextCommand) {
            await this.nextCommand.execute();
        }
    }

}

export class EndTurnCommand extends Command {

    callback: () => void;
    constructor(e: () => void) {
        super();
        this.callback = e;
    }

    async execute(): Promise<void> {
        if (this.callback) {
            this.callback();
        }
    }
}

export class MoveCommand extends Command {
    /**
     * 移动人物
     */
    target: Mediator;

    /**
     * 目标坐标，世界坐标
     */
    targetPos: Vec3;

    /**
     * 移动完成的时间
     */
    time: number;
    constructor(target: Mediator, targetPos: Vec3, time: number) {
        super();
        this.target = target;
        this.targetPos = targetPos;
        this.time = time;
        this.duration = this.time;
    }

    async execute(): Promise<void> {
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

    attacker: Mediator;
    defender: Mediator;
    damage: number;
    constructor(attacker: Mediator, denfender: Mediator, damage?: number) {
        super();
        this.attacker = attacker;
        this.defender = denfender;
        this.damage = damage;
        this.duration = this.attacker.stateMachine.getAnimationDuration(States.ATTACKING) * 0.5;
    }

    async execute(): Promise<void> {
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

    target: Mediator;
    damage: number;
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

    async execute(): Promise<void> {
        if (this.target.isAlive) {
            this.target.changeState(States.HURT);
            const currentHp = this.target.actor.hp - this.damage;
            this.target.setHp(currentHp > 0 ? currentHp : 0);
            const damageNode = await ResPool.Instance.getNode(PoolType.DAMAGE);
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

   target: Mediator;
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

    async execute(): Promise<void> {
        if (this.target.isAlive) {
            this.target.changeState(States.DYING);
            const battleField = director.getScene().getChildByName("Canvas").getComponentInChildren(BattleField);
            let isActorFromLeft = battleField.isActorFromLeft(this.target);
            if (!isActorFromLeft) {
                let dropId = this.target.actor.cfg.drop;
                let dropAmount = this.target.actor.cfg.dropAmount;
                AccountInfo.requestAddItem(dropId, dropAmount, () => { });
            }
            const damageNode = await ResPool.Instance.getNode(PoolType.DAMAGE);
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

    attacker: Mediator;
    defender: Mediator;
    constructor(attacker: Mediator, defender: Mediator) {
        super();
        this.attacker = attacker;
        this.defender = defender;
        this.duration = this.attacker.stateMachine.getAnimationDuration(States.SHOOTING);
    }

    async execute(): Promise<void> {
        if (this.attacker.isAlive && this.defender.isAlive) {
            this.attacker.changeState(States.SHOOTING);
            this.attacker.scheduleOnce(() => {
                this.complete();
            }, this.duration);
        }
    }
}

export class BulletFireCommnad extends Command {

    bullet: Node;
    attacker: Mediator;
    target: Mediator;
    damage: number;

    constructor(bullet: Node, attacker: Mediator, target: Mediator, duration: number, damage?: number) {
        super();
        this.bullet = bullet;
        this.attacker = attacker;
        this.target = target;
        this.damage = damage;
        this.duration = duration;
    }

    async execute(): Promise<void> {
        if (this.target && this.target.isAlive) {
            const effectLayer = director.getScene().getChildByName("Canvas").getChildByName('EffectLayer');
            effectLayer.addChild(this.bullet);
            const shootingMediator = this.attacker.getComponent(ShootingMediator);
            this.bullet.worldPosition = shootingMediator.arrow.worldPosition;
            const bulletComponent = this.bullet.getComponent(Bullet);
            shootingMediator.changeState(States.IDLE);
            bulletComponent.fire(this.target, this.duration - 0.1, this.attacker.isReverse, async () => {
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
                    await hurtCommand.execute();
                } else {
                    const deadCommand = new DeadCommand(this.target);
                    await deadCommand.execute();
                }
                const explosion = new BulletFireExplosion(this.target);
                await explosion.execute();
                this.complete();
            })
        } else {
            this.attacker.changeState(States.IDLE);
            this.complete();
        }
    }
}

export class BulletFireExplosion extends Command {

    target: Mediator;
    explosionNode: Node;
    constructor(target: Mediator) {
        super();
        this.target = target;
    }
    async execute(): Promise<void> {
        this.explosionNode = await ResPool.Instance.getNode(PoolType.EXPLOSION);
        const animation = this.explosionNode.getComponent(Animation);
        this.duration = this.explosionNode.getComponent(Animation).defaultClip.duration;

        this.target.model.addChild(this.explosionNode);
        if (animation) {
            animation.play();
            this.target.scheduleOnce(() => {
                ResPool.Instance.putNode(PoolType.EXPLOSION, this.explosionNode);
                this.explosionNode.removeFromParent();
                this.complete();
            }, this.duration)
        }
    }
}

export class MainSkillCastCommand extends Command {

    caster: Mediator;
    defenders: Mediator[];
    mainSkill: MainSkill;
    skillId: number;
    battleField: BattleField;
    constructor(caster: Mediator, denfenders: Mediator[], skillId: number, battleField: BattleField) {
        super();
        this.caster = caster;
        this.defenders = denfenders;
        this.skillId = skillId;
        this.battleField = battleField;
    }

    async preloadRes(): Promise<void> {
        this.mainSkill = await MainSkillFactory.createMainSkill(this.skillId, this.caster, this.defenders, this.battleField);
        if (this.mainSkill) {
            this.duration = this.mainSkill.duration;
        }
    }

    getMoveTarget(): Mediator {
        return this.mainSkill.getMoveTarget();
    }

    async execute(): Promise<void> {
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