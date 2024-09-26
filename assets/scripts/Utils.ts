import { AccountInfo } from "./AccountInfo";
import { Constants } from "./Constants";
import GameTsCfg from "./data/client/GameTsCfg";
import { Item } from "./Item";
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

    static getFakeDataAttack(baseAttack: number, level: number): number {
        return baseAttack + (level - 1) * Constants.attackRaisePerLevel;
    }

    static getFakeDataBagItmes() {
        let itemsCfg = GameTsCfg.Item;
        for (let i = 0; i < Object.keys(itemsCfg).length; i++) {
            let itemCfg = itemsCfg[Object.keys(itemsCfg)[i]];
            let amount = 999;
            if (itemCfg.id == 13) {
                amount = 1000;
            }
            let item = new Item(itemCfg.id, itemCfg.name, itemCfg.des, itemCfg.spriteFrame, amount);
            AccountInfo.getInstance().bag.set(item.id, item);
        }
    }

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


