import GameTsCfg from "../data/client/GameTsCfg";

export const AttackType = {
    MeleeAttack: 1,
    Shooting: 2,
    Chest: 3
}

export class ActorIdFactory {

    static _id: number = 1;

    static createUUID(): number {
        return this._id++;
    }
}

export class Actor {

    constructor(id: number) {
        this.uuId = ActorIdFactory.createUUID()
        this.id = id;
        const cfg = GameTsCfg.Actor[this.id];
        if (cfg) {
            this.cfg = cfg;
            this.attack = this.cfg?.attack as number;
            this.denfence = this.cfg?.defence as number;
            this.speed = this.cfg?.speed as number;
            this.hp = this.cfg?.hp as number;
            this.rage = this.cfg?.rage as number;
            this.taunt = this.cfg?.taunt as number;
        }
    }

    private _cfg;
    /**
     * 配置文件
     */
    public get cfg() {
        return this._cfg;
    }
    public set cfg(value) {
        this._cfg = value;
    }

    private _uuId;
    public get uuId() {
        return this._uuId;
    }
    public set uuId(value) {
        this._uuId = value;
    }

    private _id;
    /**
     * id
     */
    public get id() {
        return this._id;
    }
    public set id(value) {
        this._id = value;
    }

    private _level;
    /**
     * 等级
     */
    public get level() {
        return this._level;
    }
    public set level(value) {
        this._level = value;
    }


    private _hp;
    /**
     * 血量
     */
    public get hp() {
        return this._hp;
    }
    public set hp(value) {
        this._hp = value;
    }

    private _rage: number;
    /**
     * 怒气值
     */
    public get rage() {
        return this._rage;
    }
    public set rage(value) {
        this._rage = value;
    }

    private _attack;
    /**
     * 攻击力
     */
    public get attack() {
        return this._attack;
    }
    public set attack(value) {
        this._attack = value;
    }


    private _denfence;
    /**
     * 防御力
     */
    public get denfence() {
        return this._denfence;
    }
    public set denfence(value) {
        this._denfence = value;
    }

    private _speed;
    /**
     * 速度
     */
    public get speed() {
        return this._speed;
    }
    public set speed(value) {
        this._speed = value;
    }

    private _taunt: number = 0;
    /**
     * 嘲讽
     */
    public get taunt(): number {
        return this._taunt;
    }
    public set taunt(value: number) {
        this._taunt = value;
    }
}


