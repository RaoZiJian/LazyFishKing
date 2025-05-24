import { _decorator, log } from 'cc';
import { Actor } from './Actor/Actor';
import { Item } from './Item';
import { TestAccountId } from './Constants';
import { getData, postdata } from './Request/HttpRequest';
import GameTsCfg from './data/client/GameTsCfg';
import { Mediator } from './mediator/Mediator';

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

    private static get instance(): AccountInfo {
        if (!this._instance) {
            this._instance = new AccountInfo();
        }
        return this._instance;
    }
    // 账户信息请求
    static async requestAccountInfo() {
        // 异步发送账户信息到服务器，并处理响应数据
        await getData('http://localhost:3000/account?accountId=' + TestAccountId,)
            .then((response) => {
                // 日志输出账户信息
                log("/account: ", response);
                if (response.success == true) {
                    const account = response.data;
                    // 解析并存储演员信息
                    this.parseActor(account.actors);
                    // 解析并存储背包信息
                    this.parseBag(account.bags);
                    // 更新账户等级
                    this.level = account?.level;
                    // 更新账户经验值
                    this.exp = account?.exp;
                    // 更新账户名称
                    this.accountName = account?.name;
                    // 更新账户头像
                    this.avatar = account?.avatar;
                }

            }).catch((error) => {
                // 日志输出错误信息
                log("/account/ error: ", error);
            });
    }

    /**
     * 静态异步方法：请求更新账户等级
     * 
     * 该方法用于向服务器请求更新账户的等级，并在成功后通过回调函数通知调用者
     * 它通过发送POST请求到指定的URL，来更新账户信息如果请求成功并且数据中包含账户信息，
     * 则会更新当前实例的等级(level)、经验值(exp)、账户名(accountName)和头像(avatar)
     * 
     * @param cb 更新完成后调用的回调函数，用于通知调用者更新操作已完成
     */
    static async requestUpdateAccountLevel(cb: () => void) {
        // 准备请求数据，包括账户ID和要更新的等级
        const reqData = { accountId: TestAccountId };

        // 发送POST请求到指定URL，请求更新账户等级
        await postdata('http://localhost:3000/account/updateLevel', reqData)
            .then((response) => {
                // 日志记录：服务器响应数据
                log("/account/updateLevel: ", response);

                // 如果服务器返回的数据中包含账户信息，则更新当前实例的相关属性
                if (response.success == true) {
                    const account = response.data;
                    this.level = account.level;
                    this.exp = account.exp;
                    this.parseBag(account.bags)
                }

                // 调用回调函数，通知调用者更新操作已完成
                cb?.();
            }).catch((error) => {
                // 日志记录：请求发生错误
                log("/account/updateLevel error: ", error);
            });
    }

    /**
     * 静态异步方法：请求更新指定演员的等级
     * 
     * 该方法负责向服务器发送请求，以更新指定演员的等级和经验
     * 它首先构造请求数据，然后发送POST请求，并在请求成功后处理响应数据
     * 如果提供了回调函数，则在更新完成后调用该函数
     * 
     * @param actorId 演员ID，用于标识需要更新等级的演员
     * @param cb 可选的回调函数，当演员等级更新完成后会被调用
     */
    static async requestUpdateActorLevel(actorId: number, cb: () => void) {
        // 构造请求数据，包括测试账号ID和演员ID
        const reqData = { accountId: TestAccountId, actorId: actorId };

        // 发送POST请求以更新演员等级
        await postdata('http://localhost:3000/account/updateActorLevel', reqData)
            .then((response) => {
                // 日志记录响应数据
                log("/actor/updateActorLevel: ", response);

                // 如果响应数据存在且包含账户信息，则处理演员等级和经验更新
                if (response.success == true) {
                    const account = response.data;
                    this.parseBag(account.bags);
                    this.parseActor(account.actors);
                }

                // 如果提供了回调函数，则调用之
                if (cb) {
                    cb();
                }
            }).catch((error) => {
                // 日志记录错误信息
                log("/actor/updateActorLevel error: ", error);
            });
    }

    /**
     * 击倒敌人掉落物品请求
     * 
     * 本函数构造请求数据，调用后端接口以添加项目到指定账户中
     * 在接口调用成功后，还会调用类中的addItem方法来更新客户端的状态
     * 
     * @param itemId 项目ID，用于指定需要添加的项目
     * @param amount 数量，需要添加的项目的数量
     * @param attackerId 攻击者id
     * @param attackLevel 攻击者等级
     * @param cb 回调函数，添加操作完成后执行的函数
     */
    static async requestDropEnemyItem(itemId: number, amount: number, attackerId: number, attackerLevel: number, cb: () => void) {
        const reqData = { accountId: TestAccountId, itemId: itemId, amount: amount, attackerId: attackerId, attackerLevel: attackerLevel };

        // 发起POST请求到后端接口
        await postdata('http://localhost:3000/account/dropEnemyItem', reqData)
            .then((response) => {
                // 日志记录接口返回的数据
                log("/account/dropEnemyItem: ", response);

                // 如果返回数据中包含account字段，则调用addItem方法更新状态
                if (response.success == true) {
                    this.addItem(itemId, amount);
                }

                // 如果回调函数存在，则执行回调函数
                if (cb) {
                    cb();
                }
            }).catch((error) => {
                // 日志记录接口调用错误
                log("/account/dropEnemyItem error: ", error);
            });
    }

    /**
     * 解析演员数据
     * 此静态方法用于将给定的演员数据数组解析为Actor对象数组
     * 在解析过程中，会检查每个演员数据是否包含必要的actorId，
     * 如果不包含，则记录错误信息并跳过该数据
     * 此外，还会初始化Actor对象的等级和经验，如果数据中包含这些信息
     * 
     * @param actorData 演员数据数组，每个元素包含演员的相关信息
     */
    private static parseActor(actorData: any[]) {
        // 对每个演员数据进行映射，生成新的Actor对象数组
        this.instance._actors = actorData.map(data => {
            // 检查演员数据中是否包含actorId，如果没有，则记录错误信息并返回null
            if (!data.actorId) {
                log("actorData error: no actorId", data);
                return null;
            }
            const actor = new Actor(data.actorId);
            actor.level = data?.level;
            actor.exp = data?.exp;
            return actor;
        }).filter(Boolean); // 过滤掉因缺少actorId而生成的null值
    }

    /**
     * 解析背包数据
     * 此方法主要用于将原始背包数据转换为Item对象，并存储在背包中
     * @param bagData 背包数据数组，每个元素包含物品信息
     */
    private static parseBag(bagData: any[]) {
        const itemCfg = GameTsCfg.Item;
        for (let i = 0; i < bagData.length; i++) {
            if (bagData[i].itemId) {
                const itemInfo = itemCfg[bagData[i].itemId];
                let item = new Item(bagData[i].itemId, itemInfo.name, itemInfo.desc, itemInfo.spriteFrame, bagData[i].amount);
                this.instance._bag.set(bagData[i].itemId, item);
            }
        }
    }

    public static getMoney(): number {
        return this.instance._bag.get(13).amount;
    }

    /**
     * 角色等级提升功能
     * 当角色的经验值达到升级要求时调用此方法，尝试将角色等级提升一级
     * 
     * @param cb 升级完成后调用的回调函数，用于通知调用者升级过程结束
     */
    static async acountLevelUp(cb: () => void) {
        // 请求更新账户等级，确保当前等级与服务端同步
        await this.requestUpdateAccountLevel(() => {
            cb?.();
        });
    }


    /**
     * 角色升级函数
     * 
     * 此函数用于使指定的角色升级升级操作可能涉及复杂的逻辑和数据更新，
     * 因此采用异步方式处理，并通过回调函数通知调用者升级操作完成
     * 
     * @param actorId 角色ID，用于标识需要升级的角色
     * @param cb 回调函数，当升级操作完成后会被调用如果不需要回调，可以传入null或不传
     */
    static async actorLevelUp(actorId: number, cb: () => void) {
        await this.requestUpdateActorLevel(actorId, () => {
            if (cb) {
                cb();
            }
        });
    }

    /**
     * 向背包中添加物品
     * 如果物品已存在，则增加其数量
     * 
     * @param itemId 物品ID
     * @param amount 要添加的物品数量
     */
    public static addItem(itemId: number, amount: number) {
        // 尝试从背包中获取指定ID的物品
        let item = this.bag.get(itemId);

        // 如果物品存在，则累加数量
        if (item) {
            item.amount += amount;
        }
    }
}


