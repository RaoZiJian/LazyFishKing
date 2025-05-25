import { _decorator, Color, Component, Graphics, Node, tween, Vec2, Vec4 } from 'cc';
const { ccclass, property } = _decorator;

interface LineSegment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    displace: number;
}

@ccclass('ThunderComponent')
export class ThunderComponent extends Component {

    @property
    detail: number = 0;

    @property
    displace: number = 0;

    @property(Graphics)
    grap: Graphics;

    @property({ type: Number, tooltip: "The number of times to repeat the animation" })
    repeatTimes: number = 100;

    //重复闪电的闪现时间
    private _internalSpeed: number = 0.01;

    //第一道闪电展开的段数
    private _firstLightningLines: number = 10;

    //第一道闪电出现后的停留时间
    private _fistLightningStayTime: number = 0.2;

    //第一道闪电展开的每条段数出现的速度
    private _fisrtLightningLinesInternalSpeed: number = 0.1;

    /**
     * 获取闪电持续时间，由第一道闪电的展开时间，和后面的重复闪电的连续时间组成
     */
    public getDuration(): number {
        return this.repeatTimes * this._internalSpeed + this._firstLightningLines * this._fisrtLightningLinesInternalSpeed + this._fistLightningStayTime;
    }

    // 闪电路径缓存
    private path: { startPoint: Vec2, endPoint: Vec2 }[] = [];
    /**
     * 开始闪电，第一道闪电会从起点到终点按线条展开，后面的重复的闪电会连续直接出现
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     */
    public startLightning(x1: number, y1: number, x2: number, y2: number) {
        this.generateLightningPath(x1, y1, x2, y2, this.displace);
        this.drawLightningPath(true, () => {
            this.schedule(() => {
                this.generateLightningPath(x1, y1, x2, y2, this.displace);
                this.drawLightningPath(false, undefined);
            }, this._internalSpeed, this.repeatTimes);
        });
    }

    endLightining() {
        this.grap.clear();
        this.grap.node.removeFromParent();
        this.node.removeFromParent();
    }

    public setLineWidth(width: number) {
        this.grap.lineWidth = width;
    }


    /**
     * 绘制闪电
     * @param isDelay 表示闪电是否有展开的过程，isdelay:true，则闪电有展开过程，否则没有
     * @param cb 
     */
    public drawLightningPath(isDelay: boolean = true, cb: () => void) {
        this.grap.clear();
        this.path.sort((a, b) => a.startPoint.x - b.startPoint.x);
        if (isDelay) {
            let repeatTimes = this.path.length % this._firstLightningLines == 0 ? this.path.length / this._firstLightningLines : this.path.length / this._firstLightningLines + 1;
            let duration = repeatTimes * this._fisrtLightningLinesInternalSpeed + this._fistLightningStayTime;
            this.schedule(() => {
                for (let i = 0; i < this._firstLightningLines; i++) {
                    let line = this.path.shift();
                    if (line) {
                        this.grap.moveTo(line.startPoint.x, line.startPoint.y);
                        this.grap.lineTo(line.endPoint.x, line.endPoint.y);
                    }
                }
                this.grap.stroke();
            }, this._fisrtLightningLinesInternalSpeed, repeatTimes);
            this.scheduleOnce(() => {
                if (cb) {
                    cb();
                }
            }, duration);
        } else {
            while (this.path.length > 0) {
                let line = this.path.shift();
                if (line) {
                    this.grap.moveTo(line.startPoint.x, line.startPoint.y);
                    this.grap.lineTo(line.endPoint.x, line.endPoint.y);
                }
                this.grap.stroke();
            }
        }
    }

    /**
     * 生成闪电路径
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     * @param displace 
     */
    public generateLightningPath(x1: number, y1: number, x2: number, y2: number, displace: number) {
        // 清空现有路径
        this.path.length = 0;

        // 创建栈来模拟递归过程
        const stack: LineSegment[] = [];
        stack.push({ x1, y1, x2, y2, displace });

        while (stack.length > 0) {
            const segment = stack.pop()!;

            if (segment.displace < this.detail) {
                // 满足细节要求，直接添加线段
                this.path.push({
                    startPoint: new Vec2(segment.x1, segment.y1),
                    endPoint: new Vec2(segment.x2, segment.y2)
                });
            } else {
                // 计算中点并添加随机偏移
                const mid_x = (segment.x2 + segment.x1) / 2;
                const mid_y = (segment.y2 + segment.y1) / 2;
                const newMidX = mid_x + (Math.random() - 0.5) * segment.displace;
                const newMidY = mid_y + (Math.random() - 0.5) * segment.displace;

                // 将两个新线段添加到栈中（注意顺序）
                stack.push({
                    x1: segment.x2,
                    y1: segment.y2,
                    x2: newMidX,
                    y2: newMidY,
                    displace: segment.displace / 2
                });

                stack.push({
                    x1: segment.x1,
                    y1: segment.y1,
                    x2: newMidX,
                    y2: newMidY,
                    displace: segment.displace / 2
                });
            }
        }
    }
}

