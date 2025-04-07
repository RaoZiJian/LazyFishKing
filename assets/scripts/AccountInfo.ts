import { _decorator, log } from 'cc';
import { Actor } from './Actor/Actor';
import { Item } from './Item';
import { TestAccountId } from './Constants';
import { postdata } from './Request/HttpRequest';
import GameTsCfg from './data/client/GameTsCfg';

const { ccclass } = _decorator;

@ccclass('AccountInfo')
export class AccountInfo {
    // 静态实例引用
    private static _instance: AccountInfo = null;

    // 实例属性保持原有结构
    private _actors: Actor[] = [];
    private _baseAttack: number = 50;
    private _bag: Map<number, Item> = new Map<number, Item>();
    private _level: number = 1;
    private _exp: number = 0;
    private _avatar: string = '';
    private _name: string = '';

    // 静态属性访问器
    static get actors(): Actor[] { return this.instance._actors; }
    static get level(): number { return this.instance._level; }
    static set level(value: number) { this.instance._level = value; }
    static get exp(): number { return this.instance._exp; }
    static set exp(value: number) { this.instance._exp = value; }
    static get avatar(): string { return this.instance._avatar; }
    static set avatar(value: string) { this.instance._avatar = value; }
    static get accountName(): string { return this.instance._name; }
    static set accountName(value: string) { this.instance._name = value; }
    static get bag(): Map<number, Item> { return this.instance._bag; }
    static get attack(): number {
        return GameTsCfg.PlayerLevel[this.level].attack || 0;
    }

    // 单例访问点
    private static get instance(): AccountInfo {
        if (!this._instance) {
            this._instance = new AccountInfo();
        }
        return this._instance;
    }
    // 请求方法
    static async requestAccountInfo() {
        const accountInfo = { accountId: TestAccountId }
        await postdata('http://localhost:8888/account', accountInfo)
            .then((data) => {
                log("/account: ", data);
                this.parseActor(data.actors);
                this.parseBag(data.bags);
                this.level = data?.level;
                this.exp = data?.exp;
                this.accountName = data?.name;
                this.avatar = data?.avatar;
            }).catch((error) => {
                log("/account/ error: ", error);
            });
    }

    // 其他请求方法改造示例
    static async requestUpdateAccountLevel(level: number, cb: () => void) {
        const reqData = { accountId: TestAccountId, level: level };
        await postdata('http://localhost:8888/account/updateLevel', reqData)
            .then((data) => {
                log("/account/updateLevel: ", data);
                if (data?.account) {
                    this.level = data.account.level;
                    this.exp = data.account.exp;
                    this.accountName = data.account.name;
                    this.avatar = data.account.avatar;
                }
                cb?.();
            }).catch((error) => {
                log("/account/updateLevel error: ", error);
            });
    }


    static async requestUpdateActorLevel(actorId: number, cb: () => void) {
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

    static async requestAddItem(itemId: number, amount: number, cb: () => void) {
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

    private static parseActor(actorData: any[]) {
        this.instance._actors = actorData.map(data => {
            if (!data.actorId) {
                log("actorData error: no actorId", data);
                return null;
            }
            const actor = new Actor(data.actorId);
            actor.level = data?.actorLevel;
            actor.exp = data?.exp;
            return actor;
        }).filter(Boolean);
    }

    private static parseBag(bagData: any[]) {
        const itemCfg = GameTsCfg.Item;
        for (let i = 0; i < bagData.length; i++) {
            if (bagData[i].itemId) {
                const itemInfo = itemCfg[bagData[i].itemId];
                let item = new Item(bagData[i].itemId, itemInfo.name, itemInfo.desc, itemInfo.spriteFrame, bagData[i].itemAmount);
                this.instance._bag.set(bagData[i].itemId, item);
            }
        }
    }

    public static getMoney(): number {
        return this.instance._bag.get(13).amount;
    }

    public static acountLevelUp(cb: () => void) {
        this.requestUpdateAccountLevel(this.level, () => {
            this.level++;
            this.exp = 0;
            if (cb) {
                cb();
            }
        });
    }

    public static actorLevelUp(actorId: number, cb: () => void) {
        this.requestUpdateActorLevel(actorId, () => {
            if (cb) {
                cb();
            }
        });
    }

    public static addItem(itemId: number, amount: number) {
        let item = this.bag.get(itemId);
        if (item) {
            item.amount += amount;
        }
    }
}


