import { _decorator, Component, Node } from 'cc';
import { Actor } from './Actor/Actor';
import { Utils } from './Utils';
import { Item } from './Item';
import { LazyFishId } from './Constants';
const { ccclass, property } = _decorator;

@ccclass('AccountInfo')
export class AccountInfo {
    private _actors: Actor[] = [];
    public get actors(): Actor[] {
        return this._actors;
    }
    public set actors(value: Actor[]) {
        this._actors = value;
    }

    private _baseAttack: number = 50;
    public get baseAttack(): number {
        return this._baseAttack;
    }

    private _bag: Map<number, Item> = new Map<number, Item>();
    public get bag(): Map<number, Item> {
        return this._bag;
    }

    private static instance: AccountInfo = undefined;

    static getInstance() {
        if (!this.instance) {
            this.instance = new AccountInfo();
            Utils.getFakeDataBagItmes();

            let myActor = new Actor(LazyFishId.MyActor);
            this.instance.actors.push(myActor);
        }

        return this.instance;
    }

    getMyActor(): Actor {
        for (let i = 0; i < this.actors.length; i++) {
            if (this.actors[i].id == LazyFishId.MyActor) {
                return this.actors[i];
            }
        }
    }

    getMoney(): number {
        return this.bag.get(13).amount;
    }

    costMoney(cost: number) {
        this.bag.get(13).amount -= cost;
    }

    levelUp(actorId: number) {
        for (let i = 0; i < this.actors.length; i++) {
            if (actorId == this.actors[i].id) {
                this.actors[i].level += 1;
                this.actors[i].exp = 0;
            }
        }
    }

    addItem(itemId: number, amount: number) {
        let item = this.bag.get(itemId);
        if (item) {
            item.amount += amount;
        }
    }
}


