import { _decorator, Component, director, Graphics, Label, Node, profiler, UIOpacity, Vec3 } from 'cc';
import GameTsCfg from './data/client/GameTsCfg';
import { Constants, LazyFishId } from './Constants';
import { Utils } from './Utils';
import { Mediator } from './mediator/Mediator';
import { Actor, AttackType } from './Actor/Actor';
import { AttackCommand, BulletFireCommnad, Command, EndTurnCommand, MainSkillCastCommand, MoveCommand, ShootingCommand } from './Command/Command';
import { ShootingMediator } from './mediator/ShootingMediator';
import { FireAreaFiled } from './FireAreaFiled';
import { AccountInfo } from './AccountInfo';
import { FishNodePool } from './FishNodePool';
import { PoolType, ResPool } from './ResPool';
import { ThunderComponent } from './ThunderComponent';
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

    @property({ type: Label, tooltip: "加载进度" })
    preloadProgress: Label;

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
        this.showLoading(true);
        await Promise.all([
            AccountInfo.requestAccountInfo(),
            ResPool.Instance.initialize(true),
            // 带进度回调的预制体预加载
            this.preloadPrefabs(progress => {
                this.scheduleOnce(() => {
                    this.preloadProgress.string = `资源预加载进度：${progress.percent}%`;
                });
            })
        ]);
        this.preloadProgress.string = "";
        await Promise.all([
            this.initMyFishes(),
            this.initEnemyFishes()
        ]);

        this.showLoading(false);
        this.stageLabel.getComponent(UIOpacity).opacity = 0;
        this.stageLabel.string = "第" + this.currentStage + "关";
        this.stageLabel.getComponent(UIOpacity).opacity = 255;

        // 开始战斗循环，传入所有武将的列表
        await this.battleLoop(([...this.leftFishes, ...this.rightFishes]));
        // 打开触摸发动攻击的面板
        this.fireAreaField.openFire(this.rightFishes);
    }
    
    /**
     * 异步预加载所有武将的prefab资源
     * 此函数的目的是在游戏开始之前加载所有必要的武将模型，以提高游戏运行时的性能
     */
    async preloadPrefabs(
        onProgress?: (progress: { percent: number; loaded: number; total: number }) => void
    ) {
        const actorKeys = Object.keys(GameTsCfg.Actor);
        const total = actorKeys.length;
        let loaded = 0;
        const loadPromises = actorKeys.map(key => {
            const prefab = GameTsCfg.Actor[key].prefab;
            return FishNodePool.preloadSingle(prefab, 1)
                .then(() => {
                    loaded++;
                    onProgress?.({
                        percent: Math.round((loaded / total) * 100),
                        loaded,
                        total
                    });
                });
        });
        await Promise.all(loadPromises);
    }

    /**
     * 异步初始化我的武将
     * 该方法遍历账户信息中的所有武将，并在场景中添加相应的武将节点
     * Actor中也将个人账户保存了进去，目前处理为忽略
     */
    async initMyFishes() {
        // 遍历账户信息中的所有武将
        for (let i = 0; i < AccountInfo.actors.length; i++) {
            const actor = AccountInfo.actors[i];
            // 检查武将ID是否为要忽略的特定ID
            if (actor.id != LazyFishId.MyActor) {
                const fishURL = GameTsCfg.Actor[actor.id].prefab;
                // 从武将节点池中获取武将节点
                let fishNode = await FishNodePool.get(fishURL);
                // 如果成功获取武将节点，则将其添加到场景中
                if (fishNode) {
                    this.node.addChild(fishNode);
                    fishNode.setPosition(this.LeftFishAreas[i].position);
                    const mediator = fishNode.getComponent(Mediator);
                    await mediator.loadingActor(actor);
                    this.leftFishes.push(mediator);
                }
            }
        }
    }

    /**
     * 异步初始化敌方武将类
     * 
     * 解析关卡中的武将类ID，并根据这些ID创建武将类实例并放置在游戏场景中
     */
    async initEnemyFishes() {
        // todo http request get currentStage
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

    /**
     * 获取下一个行动的武将
     * 该函数用于从一组武将中筛选出下一个应该执行动作的武将
     * 主要依据武将的速度属性进行排序，速度较快的武将优先行动
     * 
     * @param targets {Mediator[]} - 一组武将对象，从中确定下一个行动的武将
     * @returns {Mediator} - 返回速度最快的活着的武将，如果没有合适的武将则返回undefined
     */
    getNextActionActor(targets: Mediator[]) {
        // 筛选出所有活着的武将
        let aliveActors = Utils.getAliveActors(targets);

        // 按照武将的速度降序排序
        const sortedActors = aliveActors.sort((a, b) => {
            // 如果武将未定义，输出日志以便调试
            if (a.actor == undefined) {
                console.log('pause');
            }
            // 根据武将的速度进行比较，速度较快的武将排在前面
            return b.actor.speed - a.actor.speed;
        })

        // 如果排序后的武将数组不为空，返回第一个武将，否则返回undefined
        if (sortedActors) {
            return sortedActors[0];
        }
    }

    /**
     * 判断目标武将是否来自左侧
     * 
     * 此函数通过比较目标武将与左侧武将集合中的元素是否具有相同的UUID来确定目标是否来自左侧
     * 它用于在某种场景下区分或识别特定的武将对象
     * 
     * @param target Mediator类型的参数，表示待检查的目标武将
     * @returns 返回一个布尔值，如果目标武将来自左侧，则为true；否则为false
     */
    isActorFromLeft(target: Mediator): boolean {
        let result = false;
        // 遍历左侧武将集合，检查是否有与目标武将相同的UUID
        this.leftFishes.forEach(element => {
            if (element.actor.uuId == target.actor.uuId) {
                result = true;
            }
        });

        return result;
    }

    /**
     * 检查施法者是否可以使用其主技能
     * 
     * 此函数主要用于判断当前施法者是否有足够的怒气来使用其配置的主技能它首先获取施法者配置的主技能ID，
     * 然后检查该游戏配置中是否存在该技能如果存在，则进一步检查施法者当前的怒气值是否达到技能所需的怒气消耗
     * 
     * @param caster {Mediator} - 施法者对象，即请求施放技能的实体
     * @returns {boolean} 如果施法者可以使用其主技能，则返回true；否则返回false
     */
    isCanSkill(caster: Mediator): boolean {
        // 获取施法者的主技能ID
        const skillId = caster.actor.cfg.MainSkill;
        // 检查游戏配置中是否存在该主技能
        if (GameTsCfg.MainSkill[skillId]) {
            // 获取主技能所需的怒气消耗
            const rageCost = GameTsCfg.MainSkill[skillId].rageCost;
            // 比较技能所需的怒气消耗与施法者当前的怒气值
            if (rageCost > caster.actor.rage) {
                // 如果怒气不足，则不能使用技能
                return false;
            } else {
                // 如果怒气足够，则可以使用技能
                return true;
            }
        }

        // 如果游戏配置中不存在该主技能，则默认返回不能使用技能
        return false;
    }
    /**
     * 异步执行战斗循环
     * @param targets 参与战斗的目标列表
     */
    async battleLoop(targets: Mediator[]) {
        //寻找攻击方和防御方
        let attacker = this.getNextActionActor(targets);
        if (!attacker) {
            return;
        }
        const isAttackerLeft = this.isActorFromLeft(attacker);
        let defender: Mediator = isAttackerLeft ? Utils.getNextDefender(this.rightFishes) : Utils.getNextDefender(this.leftFishes);

        //保存攻击者初始位置
        const startPosition = new Vec3(attacker.node.worldPosition.x, attacker.node.worldPosition.y, attacker.node.worldPosition.z);
        let headCommand: Command;
        //定义回合结束后的操作
        let endCommand = new EndTurnCommand(async () => {
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
                    //更新存活的武将列表，并继续战斗循环
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

        //根据攻击类型决定战斗流程
        let attackType = attacker.actor.cfg.attackType;
        if (attackType == AttackType.Chest) {
            headCommand = endCommand;
        } else if (this.isCanSkill(attacker)) {
            const id = attacker.actor.cfg?.MainSkill;
            const skillCfg = GameTsCfg.MainSkill[id];
            const targets = isAttackerLeft ? this.rightFishes : this.leftFishes;

            if (skillCfg.shouldMove == 1) {
                //执行技能并移动
                const skillCommand = new MainSkillCastCommand(attacker, targets, id, this);
                await skillCommand.preloadRes();
                skillCommand.nextCommand = endCommand;
                headCommand = skillCommand;
            } else {
                //执行技能前移动到指定位置再执行技能
                const skillCommand = new MainSkillCastCommand(attacker, targets, id, this);
                await skillCommand.preloadRes();
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
            //普通攻击流程
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
                //射击攻击流程
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

        //执行战斗命令
        if (headCommand) {
            await headCommand.execute();
        }
    }
    /**
     * 检查游戏是否结束
     * 
     * 本函数通过检查剩余存活的武将的数量来判断游戏是否结束如果某一方的武将全部死亡，
     * 则认为游戏结束
     * 
     * @returns {boolean} 如果游戏结束，返回true；否则返回false
     */
    checkGameover(): boolean {
        // 获取左侧剩余存活的武将
        const leftAliveFishes = Utils.getAliveActors(this.leftFishes);

        // 如果左侧没有存活的武将，则游戏结束，返回true
        if (leftAliveFishes && leftAliveFishes.length == 0) {
            return true;
        }

        // 如果左侧有存活的武将，则游戏未结束，返回false
        return false;
    }

    /**
     * 检查是否存在下一关卡。
     * 
     * 该方法通过检查当前关卡配置中是否存在下一个关卡来确定游戏是否还有后续关卡。
     * 
     * @returns 如果存在下一关卡，返回 true；否则返回 false。
     */
    hasNextStage(): boolean {
        // 获取游戏的关卡配置
        const stageCfg = GameTsCfg.Stage;

        // 判断当前关卡的下一个关卡配置是否存在
        if (!stageCfg[this.currentStage + 1]) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 异步方法：进入下一个关卡
     * 本方法负责推进游戏进程到下一关卡，包括加载、初始化和启动新关卡的战斗循环
     */
    async gotoNextStage() {
        this.showLoading(true);
        // 禁止触摸发射火球
        this.fireAreaField.closeFire();
        this.currentStage++;
        this.stageLabel.string = "第" + this.currentStage + "关";
        // 重新计算剩余的武将，准备下一关卡的战斗
        this.leftFishes = Utils.getAliveActors(this.leftFishes);

        // 重置右侧武将数组，准备重新初始化
        this.rightFishes = [];
        // 初始化敌方武将，此处使用await因为该过程可能涉及异步操作
        await this.initEnemyFishes();
        this.showLoading(false);
        // 启动战斗循环，包含所有剩余的武将，此处使用await因为战斗循环可能是异步的
        await this.battleLoop([...this.leftFishes, ...this.rightFishes]);
        // 开启触摸发射火球，针对右侧的武将
        this.fireAreaField.openFire(this.rightFishes);
    }

    showLoading(isShow: boolean) {
        this.loadingOpacity.opacity = isShow ? 255 : 0;
    }
}