import { Constants } from "./Constants";
import GameTsCfg from "./data/client/GameTsCfg";
import { Mediator } from "./mediator/Mediator";

/**
 * Utils类提供了一系列静态方法，用于处理游戏中的各种逻辑和计算
 */
export class Utils {
    /**
     * 解析输入字符串或数字，将其转换为数字数组或字符串数组
     * @param input 输入的字符串或数字
     * @returns 数字数组或字符串数组，取决于输入的内容
     */
    static parseString(input): (number | string)[] {
        // 如果输入是数字，将其转换为字符串
        if (typeof (input) == "number") {
            input = (input as number).toString();
        }

        // 将输入字符串按逗号分割为数组
        const parts = input.split(',');

        // 检查数组是否可以完全转换为数字
        const isNumberArray = parts.every(part => !isNaN(Number(part)));

        // 根据检查结果，将数组转换为数字数组或保持字符串数组
        if (isNumberArray) {
            return parts.map(part => Number(part));
        } else {
            return parts;
        }
    }

    /**
     * 从给定的目标数组中过滤出所有活着的武将（Actor）
     * @param targets 目标数组
     * @returns 过滤后的活着的武将数组
     */
    static getAliveActors(targets: Mediator[]) {
        return targets.filter(actor => actor.isAlive == true);
    }

    /**
     * 获取下一个应被攻击的目标，根据武将的taunt值排序
     * @param targets 目标数组
     * @returns 排序后的第一个目标，即taunt值最高的活着的武将
     */
    static getNextDefender(targets: Mediator[]) {
        if (targets && targets.length > 0) {
            let aliveActors = this.getAliveActors(targets);
            const sortedActors = aliveActors.sort((a, b) => {
                return b.actor.taunt - a.actor.taunt;
            })

            if (sortedActors) {
                return sortedActors[0];
            }
        }
    }

    /**
     * 随机选择给定数量的目标
     * @param targets 目标数组
     * @param amount 需要选择的目标数量
     * @returns 随机选择的目标数组
     */
    static getRandomActors(targets: Mediator[], amount: number) {
        const random = Math.random();
        const shuffTargets = targets.sort(() => 0.5 - random);
        let result = []

        // 根据给定数量选择目标，如果目标不足，则返回所有目标
        if (shuffTargets.length >= amount) {
            for (let i = 0; i < amount; i++) {
                result.push(shuffTargets[i])
            }
        } else {
            return shuffTargets;
        }

        return result;
    }

    /**
     * 计算假数据攻击值，基于基础攻击和等级
     * @param baseAttack 基础攻击值
     * @param level 等级
     * @returns 计算后的攻击值
     */
    static getFakeDataAttack(baseAttack: number, level: number): number {
        return baseAttack + (level - 1) * Constants.attackRaisePerLevel;
    }

    /**
     * 计算升级所需的代价
     * @param level 当前等级
     * @param exp 当前经验
     * @returns 升级所需的代价
     */
    static getLevelUpCost(level: number, exp: number) {
        let levelCfg = GameTsCfg.Level;
        let nextLevel = level + 1;
        if (levelCfg && levelCfg[level] && levelCfg[level + 1]) {
            const currentLevelCfg = levelCfg[level];
            const nextLevelCfg = levelCfg[level + 1];
            const neededExp = (nextLevelCfg.exp - currentLevelCfg.exp) - exp;
            return neededExp / (nextLevelCfg.exp - currentLevelCfg.exp) * nextLevelCfg.cost;
        }
    }

    /**
     * 计算玩家等级升级所需的代价
     * @param level 当前等级
     * @param exp 当前经验
     * @returns 玩家等级升级所需的代价
     */
    static getAccountLevelUpCost(level: number, exp: number) {
        let playerLevelCfg = GameTsCfg.PlayerLevel;
        let nextLevel = level + 1;
        if (playerLevelCfg && playerLevelCfg[level] && playerLevelCfg[level + 1]) {
            const currentLevelCfg = playerLevelCfg[level];
            const nextLevelCfg = playerLevelCfg[level + 1];
            const neededExp = (nextLevelCfg.exp - currentLevelCfg.exp) - exp;
            return neededExp / (nextLevelCfg.exp - currentLevelCfg.exp) * nextLevelCfg.cost;
        }
    }

    /**
     * 计算升级的百分比进度
     * @param level 当前等级
     * @param exp 当前经验
     * @returns 升级的百分比进度
     */
    static getLevelUpPercent(level: number, exp: number) {
        let levelCfg = GameTsCfg.Level;
        let nextLevel = level + 1;
        if (levelCfg && levelCfg[level] && levelCfg[level + 1]) {
            const currentLevelCfg = levelCfg[level];
            const nextLevelCfg = levelCfg[level + 1];
            const neededExp = (nextLevelCfg.exp - currentLevelCfg.exp) - exp;
            return 1 - neededExp / (nextLevelCfg.exp - currentLevelCfg.exp)
        }
    }
}