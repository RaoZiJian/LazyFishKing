import { _decorator, Component, Node } from 'cc';
import { Actor } from './Actor/Actor';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('AccountInfo')
export class AccountInfo {

    private _name: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    private _avatarUrl: string = "fishes/Avatars/wolf";
    public get avatarUrl(): string {
        return this._avatarUrl;
    }

    public set avatarUrl(value: string) {
        this._avatarUrl = value;
    }

    private _attack;
    public get attack(): number {
        return Utils.getFakeDataAttack(50, this.level)
    }

    private _level;
    public get level() {
        return Utils.getFakeDataLevel(this.allExp);
    }

    private _allExp: number;
    public get allExp(): number {
        return this._allExp;
    }
    public set allExp(value: number) {
        this._allExp = value;
    }

    private _actors: Actor[];
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

    private static instance: AccountInfo = undefined;

    static getInstance() {
        if (!this.instance) {
            this.instance = new AccountInfo();
        }

        return this.instance;
    }
}


