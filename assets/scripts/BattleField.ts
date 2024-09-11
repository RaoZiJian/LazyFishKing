import { _decorator, Component, director, instantiate, log, Node, Prefab, profiler, resources, UIOpacity, Vec3 } from 'cc';
import GameTsCfg from './data/client/GameTsCfg';
import { Constants, LazyFishId, RES_URL } from './Constants';
import { Utils } from './Utils';
import { Mediator } from './mediator/Mediator';
import { AttackType } from './Actor/Actor';
import { AttackCommand, BulletFireCommnad, Command, EndTurnCoomand, MainSkillCastCommand, MoveCommand, ShootingCommand } from './Command/Command';
import { ShootingMediator } from './mediator/ShootingMediator';
import { BuffNode } from './BuffNode';
import { FireAreaFiled } from './FireAreaFiled';
const { ccclass, property } = _decorator;

@ccclass('BattleField')
export class BattleField extends Component {

    @property(Node)
    LeftFishAreas: Node[] = [];

    @property(Node)
    RightFishAreas: Node[] = [];

    @property(Node)
    Loading: Node;

    @property(FireAreaFiled)
    fireAreaField:FireAreaFiled;

    private _leftFishes: Mediator[] = [];
    public get leftFishes(): Mediator[] {
        return this._leftFishes;
    }
    public set leftFishes(value: Mediator[]) {
        this._leftFishes = value;
    }

    private _rightFishes: Mediator[] = [];
    public get rightFishes(): Mediator[] {
        return this._rightFishes;
    }
    public set rightFishes(value: Mediator[]) {
        this._rightFishes = value;
    }

    private _currentStage = 1;
    /**
     * 当前关卡
     */
    public get currentStage() {
        return this._currentStage;
    }
    public set currentStage(value) {
        this._currentStage = value;
    }

    private _allPrefabCount: number = 1;
    private _prefabLoadingCount: number = 0;
    private _isBattleBegin: boolean = false;

    fetchMyFishes() {
        //htttp request get my fishes
        const myFishes = [9, 3, 3, 4, 8]
        for (let i = 0; i < myFishes.length; i++) {
            const id = myFishes[i];
            const fishURL = GameTsCfg.Actor[id].prefab;

            resources.load(fishURL, Prefab, (error, prefab) => {
                if (prefab) {
                    let fishNode = instantiate(prefab);
                    this.node.addChild(fishNode);
                    fishNode.setPosition(this.LeftFishAreas[i].position);
                    const mediator = fishNode.getComponent(Mediator);
                    this.leftFishes.push(mediator);
                    this._prefabLoadingCount++;
                }
            })
        }

        this._allPrefabCount = myFishes.length;
    }

    initEnemyFishes() {
        // http request get currentStage
        const stages = GameTsCfg.Stage;
        if (stages[this.currentStage]) {
            const stage = stages[this.currentStage];
            const fisheIds = Utils.parseString(stage.fisheActors);

            for (let i = 0; i < fisheIds.length; i++) {
                const id = fisheIds[i];
                const fishURL = GameTsCfg.Actor[id].prefab
                resources.load(fishURL, Prefab, (error, prefab) => {
                    if (prefab) {
                        let fishNode = instantiate(prefab);
                        this.node.addChild(fishNode);
                        fishNode.setPosition(this.RightFishAreas[i].position);
                        const mediator = fishNode.getComponent(Mediator);
                        this.rightFishes.push(mediator);
                        mediator.isReverse = -1;
                        this._prefabLoadingCount++;
                    }
                })
            }
            this._allPrefabCount += fisheIds.length;
        }
    }

    start() {
        profiler.hideStats();
        this.Loading.getComponent(UIOpacity).opacity = 255;
        this.fetchMyFishes();
        this.initEnemyFishes()
    }

    getNextActionActor(targets: Mediator[]) {
        let aliveActors = Utils.getAliveActors(targets);
        const sortedActors = aliveActors.sort((a, b) => {
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

    battleLoop(targets: Mediator[]) {

        //寻找攻击方和防御方
        let attacker = this.getNextActionActor(targets);
        if (!attacker) {
            return;
        }
        const isAttackerLeft = this.isActorFromLeft(attacker);
        let defender: Mediator = isAttackerLeft ? Utils.getNextDefender(this.rightFishes) : Utils.getNextDefender(this.leftFishes);

        const startPosition = new Vec3(attacker.node.worldPosition.x, attacker.node.worldPosition.y, attacker.node.worldPosition.z);
        let headCommand: Command;
        let endCommand = new EndTurnCoomand(() => {
            if (this.checkGameover()) {
                //todo game over
            } else {
                const rightAliveFishes = Utils.getAliveActors(this.rightFishes);
                if (rightAliveFishes && rightAliveFishes.length == 0) {
                    if (this.hasNextStage()) {
                        this.gotoNextStage();
                    } else {
                        // todo game win
                    }
                } else {
                    this.leftFishes = Utils.getAliveActors(this.leftFishes);
                    this.rightFishes = Utils.getAliveActors(this.rightFishes);
                    targets = Utils.getAliveActors(targets);
                    targets = targets.filter(fish => fish.actor.uuId != attacker.actor.uuId);
                    if (targets.length > 0) {
                        this.battleLoop(targets);
                    } else {
                        this.battleLoop([...this.leftFishes, ...this.rightFishes]);
                    }
                }
            }
        })

        if (this.isCanSkill(attacker)) {
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
            let attackType = attacker.actor.cfg.attackType;
            if (attackType == AttackType.Healing) {

            } else if (attackType == AttackType.MeleeAttack) {

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

    gotoNextStage() {
        this.Loading.getComponent(UIOpacity).opacity = 255;
        this.currentStage++;
        this.leftFishes = Utils.getAliveActors(this.leftFishes);

        this.rightFishes = [];
        this._prefabLoadingCount = 5;
        this._allPrefabCount = 5;
        this._isBattleBegin = false;
        this.initEnemyFishes();
        this.fireAreaField.closeFire();
    }

    update(deltaTime: number) {
        if (this._allPrefabCount == this._prefabLoadingCount && (this._isBattleBegin == false)) {
            this._isBattleBegin = true;
            this.Loading.getComponent(UIOpacity).opacity = 0;
            this.battleLoop(([...this.leftFishes, ...this.rightFishes]));
            this.fireAreaField.openFire(this.rightFishes);
        }
    }
}


