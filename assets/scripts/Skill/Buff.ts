import GameTsCfg from "../data/client/GameTsCfg";
import { Mediator } from "../mediator/Mediator";
import { Utils } from "../Utils";
import { Effect } from "./Effect";

export class Buff {

    private _id: number;
    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    private _effects: Effect[] = [];
    public get effects(): Effect[] {
        return this._effects;
    }
    public set effects(value: Effect[]) {
        this._effects = value;
    }

    private _targets: Mediator[] = [];
    public get targets(): Mediator[] {
        return this._targets;
    }
    public set targets(value: Mediator[]) {
        this._targets = value;
    }

    constructor(id: number) {
        const cfg = GameTsCfg.Buff[id];
        if (cfg) {
            const effectIds = Utils.parseString(cfg?.effects);
            effectIds.forEach(id => {
                const effect = new Effect(id as number);
                this.effects.push(effect);
            });
        }
    }

    work(targets: Mediator[]) {
        this.targets = targets;
        if (this.targets && this.targets.length > 0) {
            this.effects.forEach(effect => {
                this.targets.forEach(target => {
                    effect.cast(target)
                })
            });
        }

    }

    remove() {
        this.effects.forEach(effect => {
            effect.remove();
        });
    }
}