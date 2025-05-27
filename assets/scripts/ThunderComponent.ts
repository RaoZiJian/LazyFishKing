import { _decorator, Component, Graphics,  Vec2,} from 'cc';
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
    private _internalSpeed: number = 0.02;

    /**
     * 获取闪电持续时间，由第一道闪电的展开时间，和后面的重复闪电的连续时间组成
     */
    public getDuration(): number {
        return this.repeatTimes * this._internalSpeed;
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
        this.unscheduleAllCallbacks();
        this.path = [];
        this.grap.clear();
        this.schedule(() => {
            this.generateLightningPath(x1, y1, x2, y2, this.displace);
            this.drawLightningPath();
        }, this._internalSpeed, this.repeatTimes);
    }

    endLightining() {
        this.grap.clear();
        this.grap.node.removeFromParent();
        this.node.removeFromParent();
        this.path = [];
    }

    public setLineWidth(width: number) {
        this.grap.lineWidth = width;
    }
    /**
     * 绘制闪电
     */
    public drawLightningPath() {
        this.grap.clear();
        this.path.sort((a, b) => a.startPoint.x - b.startPoint.x);
        while (this.path.length > 0) {
            let line = this.path.shift();
            if (line) {
                this.grap.moveTo(line.startPoint.x, line.startPoint.y);
                this.grap.lineTo(line.endPoint.x, line.endPoint.y);
            }
            this.grap.stroke();
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
        this.path = [];

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

