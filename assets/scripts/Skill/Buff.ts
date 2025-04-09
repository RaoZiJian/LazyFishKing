import GameTsCfg from "../data/client/GameTsCfg";
import { Mediator } from "../mediator/Mediator";
import { Utils } from "../Utils";
import { Effect } from "./Effect";

/**
 * Buff类用于管理游戏中的增益效果
 * 它包括对目标施加的效果管理以及效果的执行和移除
 */
export class Buff {

    private _id: number;
    /**
     * 获取Buff的ID
     */
    public get id(): number {
        return this._id;
    }
    /**
     * 设置Buff的ID
     */
    public set id(value: number) {
        this._id = value;
    }

    private _effects: Effect[] = [];
    /**
     * 获取Buff包含的所有效果
     */
    public get effects(): Effect[] {
        return this._effects;
    }
    /**
     * 设置Buff包含的所有效果
     */
    public set effects(value: Effect[]) {
        this._effects = value;
    }

    private _targets: Mediator[] = [];
    /**
     * 获取Buff的目标
     */
    public get targets(): Mediator[] {
        return this._targets;
    }
    /**
     * 设置Buff的目标
     */
    public set targets(value: Mediator[]) {
        this._targets = value;
    }

    /**
     * 构造函数，初始化Buff
     * @param id Buff的ID，用于查找Buff的配置信息
     */
    constructor(id: number) {
        this.id = id;
        // 根据Buff的ID获取配置信息
        const cfg = GameTsCfg.Buff[id];
        if (cfg) {
            // 解析配置信息中的效果ID，并创建Effect实例
            const effectIds = Utils.parseString(cfg?.effects);
            effectIds.forEach(id => {
                const effect = new Effect(id as number);
                this.effects.push(effect);
            });
        }
    }

    /**
     * 对目标施加Buff中的效果
     * @param targets 要施加效果的目标
     */
    work(targets: Mediator[]) {
        this.targets = targets;
        // 如果有目标，则对每个目标施加每个效果
        if (this.targets && this.targets.length > 0) {
            this.effects.forEach(effect => {
                this.targets.forEach(target => {
                    effect.cast(target)
                })
            });
        }
    }

    /**
     * 移除Buff的所有效果
     */
    remove() {
        // 遍历所有效果并移除它们
        this.effects.forEach(effect => {
            effect.remove();
        });
    }
}