import { _decorator, AudioClip, AudioSource, Component, error, log, Node, ProgressBar, resources, UIOpacity, UITransform, Vec3 } from 'cc';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { Actor } from '../Actor/Actor';
import { Constants, RES_URL } from '../Constants';
import { Buff } from '../Skill/Buff';
import GameTsCfg from '../data/client/GameTsCfg';
import { Utils } from '../Utils';
import { ResourceLoader } from '../ResourceLoader';
const { ccclass, property } = _decorator;

@ccclass('Mediator')
export class Mediator extends Component {

    /**
     * 0-1
     */
    @property(ProgressBar)
    hpBar: ProgressBar;

    /**
     * 0-1
     */
    @property(ProgressBar)
    rageBar: ProgressBar;

    @property(Node)
    model: Node;

    @property(AudioSource)
    audio: AudioSource;


    private _skillAudioMap: Map<string, AudioClip> = new Map<string, AudioClip>();
    public get skillAudioMap(): Map<string, AudioClip> {
        return this._skillAudioMap;
    }
    public set skillAudioMap(value: Map<string, AudioClip>) {
        this._skillAudioMap = value;
    }

    private _uiOpacity: UIOpacity;
    /**
     * 透明度控件
     */
    public get uiOpacity(): UIOpacity {
        return this._uiOpacity;
    }
    public set uiOpacity(value: UIOpacity) {
        this._uiOpacity = value;
    }

    private _isReverse: number = 1;
    /**
     * 1: 正向 从左往右; -1:反方向 从右往左
     */
    public get isReverse(): number {
        return this._isReverse;
    }
    public set isReverse(value: number) {
        this._isReverse = value;
        this.model.scale = new Vec3(this.model.scale.x * this.isReverse, this.model.scale.y, this.model.scale.z);
    }

    /**
     * 状态机
     */
    private _stateMachine: StateMachine;
    public get stateMachine(): StateMachine {
        return this._stateMachine;
    }
    public set stateMachine(value: StateMachine) {
        this._stateMachine = value;
    }

    /**
     * actor
     */
    private _actor: Actor;
    public get actor(): Actor {
        return this._actor;
    }
    public set actor(value: Actor) {
        this._actor = value;
    }

    /**
     * 当前是否存活
     */
    private _isAlive: boolean = true;
    public get isAlive(): boolean {
        return this._isAlive;
    }
    public set isAlive(value: boolean) {
        this._isAlive = value;
    }

    private _hurtAudioClip: AudioClip;
    public get hurtAudioClip(): AudioClip {
        return this._hurtAudioClip;
    }
    public set hurtAudioClip(value: AudioClip) {
        this._hurtAudioClip = value;
    }

    private _deadAudioClip: AudioClip;
    public get deadAudioClip(): AudioClip {
        return this._deadAudioClip;
    }
    public set deadAudioClip(value: AudioClip) {
        this._deadAudioClip = value;
    }

    private _buffAudios: Map<number, AudioClip>;
    public get buffAudios(): Map<number, AudioClip> {
        return this._buffAudios;
    }
    public set buffAudios(value: Map<number, AudioClip>) {
        this._buffAudios = value;
    }

    private _castingPoint: Vec3 = Vec3.ZERO;
    public get castingPoint(): Vec3 {
        if(this.model.getChildByName("spellsNode")){
            this._castingPoint = this.model.getChildByName("spellsNode").worldPosition;
        }
        return this._castingPoint;
    }

    getModelWidth(): number {
        const scaleX = Math.abs(this.model.scale.x);
        return this.model.getComponent(UITransform).contentSize.width * scaleX;
    }

    getHp(): number {
        return this.actor.hp;
    }

    setHp(value: number) {
        if (value < 0 || value > this.actor.cfg.hp) {
            log("bad hp value " + value);
            return;
        }
        this.actor.hp = value;
        this.hpBar.progress = this.actor.hp / this.actor.cfg.hp;
    }

    getRage(): number {
        return this.actor.rage;
    }

    setRage(value: number) {
        if (value < 0 || value > Constants.maxRage) {
            log("bad rage value " + value);
            return;
        }
        this.actor.rage = value;
        this.rageBar.progress = this.actor.rage / Constants.maxRage;
    }


    protected onLoad(): void {
        this.uiOpacity = this.getComponent(UIOpacity);
    }

    protected addInitialBuff(): void {
        const buffId = this.actor.cfg?.buff1;
        if (buffId) {
            const buff = new Buff(buffId);
            buff.work([this]);
        }
    }

    protected initRage() {
        this.setRage(this.actor.rage);
    }
    async loadingActor(actor: Actor) {
        if (actor && actor.id && actor.cfg) {
            this.actor = actor;
            this.stateMachine = this.getComponentInChildren(StateMachine);
            this.changeState(States.IDLE);
            this.initRage();
            this.addInitialBuff();
            await this.loadAudioRes();
        } else {
            log("actor is wrong");
        }
    }

    changeState(newState: string) {
        this.stateMachine.changeState(newState);
        if (newState == States.HURT) {
            this.hurt();
        } else if (newState == States.DYING) {
            this.dying();
        }
    }

    hurt() {
        const duration = this.stateMachine.getAnimationDuration(States.HURT);
        this.scheduleOnce(() => {
            this.stateMachine.changeState(States.IDLE);
        }, duration);

        this.audio.playOneShot(this.hurtAudioClip);
    }

    dying() {
        this.isAlive = false;
        this.audio.playOneShot(this.deadAudioClip);
    }
    protected async loadAudioRes(): Promise<void> {
        // 一级并行：核心音效与附加音效并行加载
        const [baseAudios, buffAudios, skillAudios] = await Promise.all([
            // 核心音效并行加载
            Promise.all([
                this.loadHurtAudio(),
                this.loadDeadAudio()
            ]),

            // Buff音效并行加载
            this.loadBuffAudios(),

            // 技能音效并行加载
            this.loadSkillAudios()
        ]);

        // 资源分配（解构并行加载结果）
        [this.hurtAudioClip, this.deadAudioClip] = baseAudios;
        this.buffAudios = new Map(buffAudios);
        this.skillAudioMap = new Map(skillAudios);
    }

    // 核心音效加载器
    private async loadHurtAudio(): Promise<AudioClip> {
        const url = RES_URL.audioPrefix + this.actor.cfg.hurtAudio;
        return ResourceLoader.loadResAsync<AudioClip>(url);
    }

    private async loadDeadAudio(): Promise<AudioClip> {
        const url = RES_URL.audioPrefix + this.actor.cfg.deadAudio;
        return ResourceLoader.loadResAsync<AudioClip>(url);
    }

    // Buff音效并行加载器
    private async loadBuffAudios(): Promise<Array<[number, AudioClip]>> {
        const buffIds = this.getBuffIds();
        const loadTasks = buffIds.map(buffId =>
            new Promise<[number, AudioClip]>(resolve => {
                const buffCfg = GameTsCfg.Buff[buffId];
                if (!buffCfg?.audio) return resolve(null);

                resources.load(buffCfg.audio, AudioClip, (err, clip) => {
                    return err ? resolve(null) : resolve([buffId, clip]);
                });
            })
        );

        const results = await Promise.all(loadTasks);
        return results.filter(Boolean) as Array<[number, AudioClip]>;
    }

    // 技能音效并行加载器  
    private async loadSkillAudios(): Promise<Array<[string, AudioClip]>> {
        const skill = this.getMainSkill();
        if (!skill?.audio) return [];

        const audioIds = Utils.parseString(skill.audio) as string[];
        const loadTasks = audioIds.map(id =>
            new Promise<[string, AudioClip]>(resolve => {
                const url = RES_URL.audioPrefix + id;
                resources.load(url, AudioClip, (err, clip) => {
                    return err ? resolve(null) : resolve([id, clip]);
                });
            })
        );

        const results = await Promise.all(loadTasks);
        return results.filter(Boolean) as Array<[string, AudioClip]>;
    }

    // Buff ID生成逻辑封装
    private getBuffIds(): number[] {
        const ids: number[] = [];
        const initialBuff = this.actor.cfg?.buff1;

        if (initialBuff) ids.push(initialBuff);

        const skill = this.getMainSkill();
        if (skill?.buffs) {
            ids.push(...Utils.parseString(skill.buffs) as number[]);
        }

        return [...new Set(ids)]; // 去重处理
    }

    // 主技能获取封装
    private getMainSkill() {
        const skillId = this.actor.cfg.MainSkill;
        return GameTsCfg.MainSkill[skillId];
    }

}


