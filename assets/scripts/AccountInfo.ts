import { _decorator, Component, log, Node } from 'cc';
import { Actor } from './Actor/Actor';
import { Utils } from './Utils';
import { Item } from './Item';
import { LazyFishId, TestAccountId } from './Constants';
import { postdata } from './Request/HttpRequest';
import GameTsCfg from './data/client/GameTsCfg';

const { ccclass } = _decorator;

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

    private _level: number = 1;
    public get level(): number {
        return this._level;
    }
    public set level(value: number) {
        this._level = value;
    }

    private _exp: number = 0;
    public get exp(): number {
        return this._exp;
    }
    public set exp(value: number) {
        this._exp = value;
    }

    private _attack: number = 0;
    public get attack(): number {
        return GameTsCfg.PlayerLevel[this.level].attack || 0;
    }

    private _avatar: string = '';
    public get avatar(): string {
        return this._avatar;
    }
    public set avatar(value: string) {
        this._avatar = value;
    }

    private _name: string = '';
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    private static instance: AccountInfo = undefined;

    static getInstance() {
        if (!this.instance) {
            this.instance = new AccountInfo();
            Utils.getFakeDataBagItmes();
        }
        return this.instance;
    }

    async requestAccountInfo(cb: () => void) {
        const accountInfo = { accountId: TestAccountId }
        await postdata('http://localhost:8888/account', accountInfo)
            .then((data) => {
                log("/account: ", data);
                this.parseActor(data.actors);
                this.parseBag(data.bags);
                this.level = data?.level;
                this.exp = data?.exp;
                this.name = data?.name;
                this.avatar = data?.avatar;
                if (cb) {
                    cb();
                }
            }).catch((error) => {
                log("/account/ error: ", error);
            });
    }

    async requestUpdateAccountLevel(level: number, cb: () => void) {
        const reqData = { accountId: TestAccountId, level: level };
        await postdata('http://localhost:8888/account/updateLevel', reqData)
            .then((data) => {
                log("/account/updateLevel: ", data);
                if (data && data.account) {
                    this.level = data.account?.level;
                    this.exp = data.account?.exp;
                    this.name = data.account?.name;
                    this.avatar = data.account?.avatar;
                }
                if (cb) {
                    cb();
                }
            }).catch((error) => {
                log("/account/updateLevel error: ", error);
            });
    }

    async requestUpdateActorLevel(actorId: number, cb: () => void) {
        const reqData = { accountId: TestAccountId, actorId: actorId };
        await postdata('http://localhost:8888/account/updateActorLevel', reqData)
            .then((data) => {
                log("/actor/updateActorLevel: ", data);
                if (data && data.account) {
                    for (let i = 0; i < this.actors.length; i++) {
                        if (actorId == this.actors[i].id) {
                            this.actors[i].level = data.account.actors[i]?.actorLevel;
                            this.actors[i].exp = data.account.actors[i]?.exp;
                        }
                    }
                }
                if (cb) {
                    cb();
                }
            }).catch((error) => {
                log("/actor/updateActorLevel error: ", error);
            });
    }

    async requestAddItem(itemId: number, amount: number, cb: () => void) {
        const reqData = { accountId: TestAccountId, itemId: itemId, amount: amount };
        await postdata('http://localhost:8888/account/addItem', reqData)
            .then((data) => {
                log("/account/addItem: ", data);
                if (data && data.account) {
                    this.addItem(itemId, amount);
                }
                if (cb) {
                    cb();
                }
            }).catch((error) => {
                log("/account/addItem error: ", error);
            });
    }

    parseActor(actorData: any[]) {
        for (let i = 0; i < actorData.length; i++) {
            if (actorData[i].actorId) {
                let actor = new Actor(actorData[i].actorId);
                actor.level = actorData[i]?.actorLevel;
                actor.exp = actorData[i]?.exp;
                this.actors.push(actor);
            } else {
                log("actorData error: no actorId", actorData[i]);
            }
        }
    }

    parseBag(bagData: any[]) {
        const itemCfg = GameTsCfg.Item;
        for (let i = 0; i < bagData.length; i++) {
            if (bagData[i].itemId) {
                const itemInfo = itemCfg[bagData[i].itemId];
                let item = new Item(bagData[i].itemId, itemInfo.name, itemInfo.desc, itemInfo.spriteFrame, bagData[i].itemAmount);
                this.bag.set(bagData[i].itemId, item);
            } else {
                log("bagData error: no itemId", bagData[i]);
            }
        }
    }

    getMoney(): number {
        return this.bag.get(13).amount;
    }

    acountLevelUp(cb: () => void) {
        this.requestUpdateAccountLevel(this.level, () => {
            this.level++;
            this.exp = 0;
            if (cb) {
                cb();
            }
        });
    }

    actorLevelUp(actorId: number, cb: () => void) {
        this.requestUpdateActorLevel(actorId, () => {
            if (cb) {
                cb();
            }
        });
    }

    addItem(itemId: number, amount: number) {
        let item = this.bag.get(itemId);
        if (item) {
            item.amount += amount;
        }
    }
}


