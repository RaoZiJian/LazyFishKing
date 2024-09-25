import { _decorator, AudioClip, AudioSource, Component, error, log, Node, ProgressBar, resources, UIOpacity, UITransform, Vec3 } from 'cc';
import { StateMachine, States } from '../stateMachine/StateMachine';
import { Actor } from '../Actor/Actor';
import { Constants, RES_URL } from '../Constants';
import { Buff } from '../Skill/Buff';
import GameTsCfg from '../data/client/GameTsCfg';
import { Effect } from '../Skill/Effect';
import { Utils } from '../Utils';
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

    start() {

    }

    update(deltaTime: number) {

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

    protected loadAudioRes() {
        const hurtAudioURL = RES_URL.audioPrefix + this.actor.cfg.hurtAudio;
        resources.load(hurtAudioURL, AudioClip, (error, audioClip) => {
            this.hurtAudioClip = audioClip;
        });

        //读取死亡音效
        const deadAudioURL = RES_URL.audioPrefix + this.actor.cfg.deadAudio;
        resources.load(deadAudioURL, AudioClip, (error, audioClip) => {
            this.deadAudioClip = audioClip;
        });

        //读取buff音效
        this.buffAudios = new Map();
        let buffIds: number[] = [];

        const initialBuffId = this.actor.cfg?.buff1;
        if (initialBuffId != "") {
            buffIds.push(initialBuffId);
        }

        let mainSkillId = this.actor.cfg.MainSkill;
        const skill = GameTsCfg.MainSkill[mainSkillId];
        if (skill.buffs != "") {
            let skillBuffs = Utils.parseString(skill.buffs) as number[];
            skillBuffs.forEach(mainSkillBuffId => {
                buffIds.push(mainSkillBuffId)
            });
        }

        buffIds.forEach(buffId => {
            const buffCfg = GameTsCfg.Buff[buffId];
            if (buffCfg.audio) {
                resources.load(buffCfg.audio, AudioClip, (error, audioClip) => {
                    if (audioClip) {
                        this.buffAudios.set(buffId, audioClip);
                    }
                });
            }
        });

        //读取主技能音效
        if (skill && skill.audio && skill.audio != "") {
            let skillAudios = Utils.parseString(skill.audio) as string[];
            skillAudios.forEach(skillAudioId=>{
                resources.load(RES_URL.audioPrefix + skillAudioId, AudioClip, (error, audioClip)=>{
                    if(audioClip){
                        this.skillAudioMap.set(skillAudioId, audioClip);
                    }
                })
            })
        }
    }
}


