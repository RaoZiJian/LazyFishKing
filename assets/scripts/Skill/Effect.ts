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

    constructor(id: number) {
        this.id = id;
        const cfg = GameTsCfg.Effect[id];
        if (cfg) {
            this.duration = cfg?.duration;
            this.property = cfg?.property;
            this.propertyValue = cfg?.propertyValue;
        }
    }

    cast(target: Mediator) {
        this.target = target;
        if (this.target && this.target.isAlive) {
            if(this.duration >0){
                if (this.target.actor[this.property]) {
                    this.target.actor[this.property] += this.propertyValue;
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

    remove() {
        if (this.target && this.target.isAlive) {
            if (this.target.actor[this.property]) {
                if (!this.isExpired) {
                    this.target.actor[this.property] -= this.propertyValue;
                    this.isExpired = true;
                }
            }
        }
    }
}