
export class Item {
    private _id: number;
    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }
    private _name: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    private _des: string;
    public get des(): string {
        return this._des;
    }
    public set des(value: string) {
        this._des = value;
    }
    private _amount: number;
    public get amount(): number {
        return this._amount;
    }
    public set amount(value: number) {
        this._amount = value;
    }

    private _spriteFrame: string;
    public get spriteFrame(): string {
        return this._spriteFrame;
    }
    public set spriteFrame(value: string) {
        this._spriteFrame = value;
    }

    constructor(id: number, name: string, des: string, spriteFrame: string, amount: number) {
        this.id = id;
        this.name = name;
        this.des = des;
        this.amount = amount;
        this.spriteFrame = spriteFrame;
    }
}


