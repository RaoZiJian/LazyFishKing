import { BattleField } from "../BattleField";
import { Mediator } from "../mediator/Mediator";
import { Utils } from "../Utils";
import { BladeWindSkill, HealingGroupSkill, JumpAttackSkill, MainSkill, SingleTauntSkill, thunderChain, WindMagicSkill } from "./MainSkill";

export const skillIdEnum = {
    taunt: 1,
    jumpAttack: 2,
    healingGroup: 3,
    windMagic: 4,
    bladeWind: 5,
    thunderChain: 6
}

export class MainSkillFactory {
    static async createMainSkill(id: number, caster: Mediator, targets: Mediator[], battleFiled: BattleField): Promise<MainSkill> {
        let skill: MainSkill;
        switch (id) {
            case skillIdEnum.taunt:
                skill = new SingleTauntSkill(id, caster, targets);
                break;
            case skillIdEnum.jumpAttack:
                skill = new JumpAttackSkill(id, caster, targets);
                break;
            case skillIdEnum.healingGroup:
                const myAlivefishes = Utils.getAliveActors(battleFiled.leftFishes);
                skill = new HealingGroupSkill(id, caster, myAlivefishes);
                break;
            case skillIdEnum.windMagic:
                skill = new WindMagicSkill(id, caster, targets);
                break;
            case skillIdEnum.bladeWind:
                skill = new BladeWindSkill(id, caster, targets);
                break;
            case skillIdEnum.thunderChain:
                skill = new thunderChain(id, caster, targets);
                break;
            default:
                break;
        }

        await skill.preloadRes();
        return skill;
    }

}