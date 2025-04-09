import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Bullet } from './Bullet';
import { Mediator } from '../mediator/Mediator';
const { ccclass, property } = _decorator;

/**
 * @class XiaoQiaoBullet
 * @extends Bullet
 * 
 * XiaoQiaoBullet类是Bullet类的子类，用于控制小乔角色的子弹逻辑以绘制不同的动画特效
 * 主要功能包括子弹的移动、旋转和碰撞检测。
 */
@ccclass('XiaoQiaoBullet')
export class XiaoQiaoBullet extends Bullet {

    /**
     * fire方法用于控制子弹的发射逻辑。
     * 
     * @param {Mediator} target - 目标对象，通常是敌人或障碍物。
     * @param {number} duration - 子弹移动的持续时间。
     * @param {number} isReverse - 标记子弹是否需要反向移动。
     * @param {() => void} callback - 子弹移动结束后的回调函数。
     */
    fire(target: Mediator, duration: number, isReverse: number, callback: () => void): void {
        // 设置子弹的反向移动标记
        this.isReverse = isReverse;
        // 设置目标对象
        this.target = target;
        
        // 创建一个tween动画，使子弹移动到目标位置
        tween(this.node)
            .to(duration, { worldPosition: this.target.model.worldPosition })
            .call(() => {
                if (callback) {
                    callback();
                }
            })
            .start();
        
        // 创建另一个tween动画，使子弹在移动过程中旋转
        tween(this.node)
            .by(duration, { angle: 1000 })
            .start();
    }
}