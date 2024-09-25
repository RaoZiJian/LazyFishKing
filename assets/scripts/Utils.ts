import { Constants } from "./Constants";
import { Mediator } from "./mediator/Mediator";

export class Utils {
    static parseString(input): (number | string)[] {

        if (typeof (input) == "number") {
            input = (input as number).toString();
        }

        const parts = input.split(',');

        const isNumberArray = parts.every(part => !isNaN(Number(part)));

        if (isNumberArray) {
            return parts.map(part => Number(part));
        } else {
            return parts;
        }
    }

    static getAliveActors(targets: Mediator[]) {
        return targets.filter(actor => actor.isAlive == true);
    }

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

    static getRandomActors(targets: Mediator[], amount: number) {
        const random = Math.random();
        const shuffTargets = targets.sort(() => 0.5 - random);
        let result = []

        if (shuffTargets.length >= amount) {
            for (let i = 0; i < amount; i++) {
                result.push(shuffTargets[i])
            }
        } else {
            return shuffTargets;
        }

        return result;
    }

    static getFakeDataLevel(exp: number) {
        return exp / Constants.levelUpExp + 1;
    }

    static getFakeDataAttack(baseAttack: number, level: number): number {
        return baseAttack + (level - 1) * Constants.levelUpExp;
    }

    static getExpRequire(level: number) {
        return (level - 1) * Constants.levelUpExp;
    }

    /**
     * 
     * @param exp 总经验值
     * @returns 目前等级下还剩余多少额外的经验值
     */
    static getCurrentLevelExp(exp: number) {
        const requireExp = this.getExpRequire(this.getFakeDataLevel(exp))
        return exp - requireExp;
    }

    /**
     * 计算当前经验值升级到下一级要花费的钱
     * @param allexp 当前总经验值
     * @param level 目标等级
     * @returns 当前经验值升级到下一级要花费的钱
     */
    static getFakeDataLevelUpCoinCost(allexp: number) {
        return this.getCurrentLevelExp(allexp) * 10;
    }
}


