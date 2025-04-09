import GameTsCfg from "../data/client/GameTsCfg";
import { Mediator } from "../mediator/Mediator";

export class Effect {

    private _id: number;
    /**
     * id
     */
    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    private _name: string;
    /**
     * 名称
     */
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    private _property: string;
    /**
     * 变更的属性名
     */
    public get property(): string {
        return this._property;
    }
    public set property(value: string) {
        this._property = value;
    }

    private _propertyValue: number;
    /**
     *  属性变更的值
     */
    public get propertyValue(): number {
        return this._propertyValue;
    }
    public set propertyValue(value: number) {
        this._propertyValue = value;
    }

    private _target: Mediator;
    /**
     * 释放作用对象
     */
    public get target(): Mediator {
        return this._target;
    }
    public set target(value: Mediator) {
        this._target = value;
    }

    private _duration: number;
    /**
     * 持续时间，单位秒。如果持续时间设置为-1，代表永久effect
     */
    public get duration(): number {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }

    private _isExpired: boolean = false;
    /**
     * 特效是否已经过期
     */
    public get isExpired(): boolean {
        return this._isExpired;
    }
    public set isExpired(value: boolean) {
        this._isExpired = value;
    }

    /**
     * 构造函数，用于初始化效果对象
     * @param id 效果的唯一标识符，用于从配置中获取效果的属性
     */
    constructor(id: number) {
        this.id = id;
        // 根据效果ID获取对应的配置信息
        const cfg = GameTsCfg.Effect[id];
        if (cfg) {
            // 如果找到了对应的效果配置，则初始化效果的属性
            this.duration = cfg?.duration;
            this.property = cfg?.property;
            this.propertyValue = cfg?.propertyValue;
        }
    }

    /**
     * 对目标施加效果
     * @param target 要施加效果的对象
     */
    cast(target: Mediator) {
        this.target = target;
        if (this.target && this.target.isAlive) {
            // 如果目标对象存在且处于存活状态
            if (this.target.actor[this.property]) {
                // 如果目标对象具有指定的属性
                this.target.actor[this.property] += this.propertyValue;
                // 更新HP bar, hp不能超过血量上限
                if (this.property == 'hp') {
                    if (this.target.actor.hp > this.target.actor.cfg.hp) {
                        this.target.actor.hp = this.target.actor.cfg.hp
                    }
                    target.setHp(this.target.actor.hp);
                }
                // 更新 rage bar, rage不能超过血量上限
                if (this.property == 'rage') {
                    if (this.target.actor.rage > this.target.actor.cfg.rage) {
                        this.target.actor.rage = this.target.actor.cfg.rage
                    }
                    target.setRage(this.target.actor.rage);
                }
                // 如果效果有持续时间，则在持续时间结束后取消效果
                if (this.duration > 0) {
                    this.target.scheduleOnce(() => {
                        if (!this.isExpired) {
                            this.target.actor[this.property] -= this.propertyValue;
                            this.isExpired = true;
                        }
                    }, this.duration);
                }
            }
        }
    }

    /**
     * 移除属性影响
     * 
     * 此方法用于从目标对象上移除之前应用的某种属性影响它首先检查目标对象是否存在且处于活动状态，
     * 然后检查目标对象的actor属性中是否包含指定的属性如果这些条件都满足，并且当前属性影响未过期，
     * 则从目标对象的actor属性中减去之前应用的属性值，并将当前属性影响标记为已过期
     */
    remove() {
        // 检查目标对象是否存在且处于活动状态
        if (this.target && this.target.isAlive) {
            // 检查目标对象的actor属性中是否包含指定的属性
            if (this.target.actor[this.property]) {
                // 检查当前属性影响是否已过期
                if (!this.isExpired) {
                    // 从目标对象的actor属性中减去之前应用的属性值，并将当前属性影响标记为已过期
                    this.target.actor[this.property] -= this.propertyValue;
                    this.isExpired = true;
                }
            }
        }
    }
}