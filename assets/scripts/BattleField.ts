import { _decorator, Component, Label, Node, profiler, UIOpacity, Vec3 } from 'cc';
import GameTsCfg from './data/client/GameTsCfg';
import { Constants, LazyFishId } from './Constants';
import { Utils } from './Utils';
import { Mediator } from './mediator/Mediator';
import { Actor, AttackType } from './Actor/Actor';
import { AttackCommand, BulletFireCommnad, Command, EndTurnCoomand, MainSkillCastCommand, MoveCommand, ShootingCommand } from './Command/Command';
import { ShootingMediator } from './mediator/ShootingMediator';
import { FireAreaFiled } from './FireAreaFiled';
import { AccountInfo } from './AccountInfo';
import { FishNodePool } from './FishNodePool';
const { ccclass, property } = _decorator;

@ccclass('BattleField')
export class BattleField extends Component {

    @property({ type: Node, tooltip: "左边武将区域" })
    LeftFishAreas: Node[] = [];

    @property({ type: Node, tooltip: "右边武将区域" })
    RightFishAreas: Node[] = [];

    @property({ type: FireAreaFiled, tooltip: "触摸发射子弹区域" })
    fireAreaField: FireAreaFiled;

    @property({ type: Label, tooltip: "当前关卡" })
    stageLabel: Label;

    @property({ type: UIOpacity, tooltip: "Loading节点" })
    loadingOpacity: UIOpacity;

    private _leftFishes: Mediator[] = [];
    private _currentStage = 1;
    private _rightFishes: Mediator[] = [];

    /**
     * 左边武将, 玩家的武将
     */
    public get leftFishes(): Mediator[] {
        return this._leftFishes;
    }
    public set leftFishes(value: Mediator[]) {
        this._leftFishes = value;
    }

    /**
     * 右边武将，敌人的武将
     */
    public get rightFishes(): Mediator[] {
        return this._rightFishes;
    }
    public set rightFishes(value: Mediator[]) {
        this._rightFishes = value;
    }

    /**
     * 当前关卡
     */
    public get currentStage() {
        return this._currentStage;
    }
    public set currentStage(value) {
        this._currentStage = value;
    }

    /**
     * 异步启动游戏
     * 本函数负责按顺序初始化游戏的各种状态和资源，并开始战斗循环
     */
    async start() {
        // 显示加载中的状态
        this.showLoading(true);
        // 请求账户信息，可能包括玩家数据和游戏设置等
        await AccountInfo.requestAccountInfo();
        // 预加载游戏资源，如模型和纹理等
        await this.preloadPrefabs();
        // 初始化玩家的鱼
        await this.initMyFishes();
        // 初始化敌方的鱼
        await this.initEnemyFishes()
        // 隐藏加载中的状态
        this.showLoading(false);

        // 设置关卡标签的透明度为0，准备更新关卡信息
        this.stageLabel.getComponent(UIOpacity).opacity = 0;
        // 更新关卡标签的文本内容
        this.stageLabel.string = "第" + this.currentStage + "关";
        // 恢复关卡标签的透明度，使其可见
        this.stageLabel.getComponent(UIOpacity).opacity = 255;
        // 开始战斗循环，传入所有鱼的列表
        await this.battleLoop(([...this.leftFishes, ...this.rightFishes]));
        // 开启右方鱼的攻击模式
        this.fireAreaField.openFire(this.rightFishes);
    }

    async preloadPrefabs() {
        const actorLength = Object.keys(GameTsCfg.Actor).length;
        for (let i = 0; i < actorLength; i++) {
            let key = Object.keys(GameTsCfg.Actor)[i];
            let prefab = GameTsCfg.Actor[key].prefab;
            await FishNodePool.preloadSingle(prefab, 1);
        }
    }

    async initMyFishes() {
        for (let i = 0; i < AccountInfo.actors.length; i++) {
            const actor = AccountInfo.actors[i];
            if (actor.id != LazyFishId.MyActor) {
                const fishURL = GameTsCfg.Actor[actor.id].prefab;
                let fishNode = await FishNodePool.get(fishURL);
                if (fishNode) {
                    this.node.addChild(fishNode);
                    fishNode.setPosition(this.LeftFishAreas[i].position);
                    const mediator = fishNode.getComponent(Mediator);
                    mediator.loadingActor(actor);
                    this.leftFishes.push(mediator);
                }
            }
        }
    }

    async initEnemyFishes() {
        // http request get currentStage
        const stages = GameTsCfg.Stage;
        if (stages[this.currentStage]) {
            const stage = stages[this.currentStage];
            const fisheIds = Utils.parseString(stage.fisheActors);

            for (let i = 0; i < fisheIds.length; i++) {
                const id = fisheIds[i] as number;
                const actor = new Actor(id);
                const fishURL = GameTsCfg.Actor[id].prefab
                let fishNode = await FishNodePool.get(fishURL);
                if (fishNode) {
                    this.node.addChild(fishNode);
                    fishNode.setPosition(this.RightFishAreas[i].position);
                    const mediator = fishNode.getComponent(Mediator);
                    mediator.loadingActor(actor);
                    this.rightFishes.push(mediator);
                    mediator.isReverse = -1;
                }
            }
        }
    }

    getNextActionActor(targets: Mediator[]) {
        let aliveActors = Utils.getAliveActors(targets);
        const sortedActors = aliveActors.sort((a, b) => {
            if (a.actor == undefined) {
                console.log('pause');
            }
            return b.actor.speed - a.actor.speed;
        })

        if (sortedActors) {
            return sortedActors[0];
        }
    }

    isActorFromLeft(target: Mediator): boolean {
        let result = false;
        this.leftFishes.forEach(element => {
            if (element.actor.uuId == target.actor.uuId) {
                result = true;
            }
        });

        return result;
    }

    isCanSkill(caster: Mediator): boolean {
        const skillId = caster.actor.cfg.MainSkill;
        if (GameTsCfg.MainSkill[skillId]) {
            const rageCost = GameTsCfg.MainSkill[skillId].rageCost;
            if (rageCost > caster.actor.rage) {
                return false;
            } else {
                return true;
            }
        }

        return false;
    }

    async battleLoop(targets: Mediator[]) {

        //寻找攻击方和防御方
        let attacker = this.getNextActionActor(targets);
        if (!attacker) {
            return;
        }
        const isAttackerLeft = this.isActorFromLeft(attacker);
        let defender: Mediator = isAttackerLeft ? Utils.getNextDefender(this.rightFishes) : Utils.getNextDefender(this.leftFishes);

        const startPosition = new Vec3(attacker.node.worldPosition.x, attacker.node.worldPosition.y, attacker.node.worldPosition.z);
        let headCommand: Command;
        let endCommand = new EndTurnCoomand(async () => {
            if (this.checkGameover()) {
                this.stageLabel.string = "游戏失败";
            } else {
                const rightAliveFishes = Utils.getAliveActors(this.rightFishes);
                if (rightAliveFishes && rightAliveFishes.length == 0) {
                    if (this.hasNextStage()) {
                        await this.gotoNextStage();
                    } else {
                        this.stageLabel.string = "游戏胜利";
                    }
                } else {
                    this.leftFishes = Utils.getAliveActors(this.leftFishes);
                    this.rightFishes = Utils.getAliveActors(this.rightFishes);
                    targets = Utils.getAliveActors(targets);
                    targets = targets.filter(fish => fish.actor.uuId != attacker.actor.uuId);
                    if (targets.length > 0) {
                        await this.battleLoop(targets);
                    } else {
                        await this.battleLoop([...this.leftFishes, ...this.rightFishes]);
                    }
                }
            }
        })
        let attackType = attacker.actor.cfg.attackType;
        if (attackType == AttackType.Chest) {
            headCommand = endCommand;
        } else if (this.isCanSkill(attacker)) {
            const id = attacker.actor.cfg?.MainSkill;
            const skillCfg = GameTsCfg.MainSkill[id];
            const targets = isAttackerLeft ? this.rightFishes : this.leftFishes;

            if (skillCfg.shouldMove == 1) {
                const skillCommand = new MainSkillCastCommand(attacker, targets, id, this);
                skillCommand.nextCommand = endCommand;
                headCommand = skillCommand;
            } else {
                const skillCommand = new MainSkillCastCommand(attacker, targets, id, this);
                const moveTarget = skillCommand.getMoveTarget();
                const targePostion = new Vec3(moveTarget.node.worldPosition.x + moveTarget.getModelWidth() * moveTarget.isReverse, moveTarget.node.worldPosition.y, moveTarget.node.worldPosition.z);
                const move = new MoveCommand(attacker, targePostion, Constants.moveDuration);
                const moveBack = new MoveCommand(attacker, startPosition, Constants.moveDuration);

                move.nextCommand = skillCommand;
                skillCommand.nextCommand = moveBack;
                moveBack.nextCommand = endCommand;
                headCommand = move;
            }

        } else {
            if (attackType == AttackType.MeleeAttack) {
                const targePostion = new Vec3(defender.node.worldPosition.x + defender.getModelWidth() * defender.isReverse, defender.node.worldPosition.y, defender.node.worldPosition.z);
                const move = new MoveCommand(attacker, targePostion, Constants.moveDuration);
                const attack = new AttackCommand(attacker, defender);
                const moveBack = new MoveCommand(attacker, startPosition, Constants.moveDuration);
                move.nextCommand = attack;
                moveBack.nextCommand = endCommand;
                attack.nextCommand = moveBack;
                headCommand = move;
            } else if (attackType == AttackType.Shooting) {
                let shootingMediator = attacker as ShootingMediator;
                let bullet = shootingMediator.cloneArrow();
                if (bullet) {
                    const shootingCommand = new ShootingCommand(attacker, defender);
                    const bulletFireCommnad = new BulletFireCommnad(bullet, attacker, defender, Constants.shootingDuration);
                    shootingCommand.nextCommand = bulletFireCommnad;
                    bulletFireCommnad.nextCommand = endCommand;
                    headCommand = shootingCommand;
                }
            }
        }

        if (headCommand) {
            headCommand.execute();
        }
    }

    checkGameover(): boolean {
        const leftAliveFishes = Utils.getAliveActors(this.leftFishes);

        if (leftAliveFishes && leftAliveFishes.length == 0) {
            return true;
        }

        return false;
    }

    hasNextStage(): boolean {
        const stageCfg = GameTsCfg.Stage;
        if (!stageCfg[this.currentStage + 1]) {
            return false;
        } else {
            return true;
        }
    }

    async gotoNextStage() {
        this.showLoading(true);
        this.fireAreaField.closeFire();
        this.currentStage++;
        this.stageLabel.string = "第" + this.currentStage + "关";
        this.leftFishes = Utils.getAliveActors(this.leftFishes);

        this.rightFishes = [];
        await this.initEnemyFishes();
        this.showLoading(false);
        await this.battleLoop(([...this.leftFishes, ...this.rightFishes]));
        this.fireAreaField.openFire(this.rightFishes);
    }

    showLoading(isShow: boolean) {
        this.loadingOpacity.opacity = isShow ? 255 : 0;
    }
}