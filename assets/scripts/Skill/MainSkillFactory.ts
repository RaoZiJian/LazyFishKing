import { BattleField } from "../BattleField";
import { Mediator } from "../mediator/Mediator";
import { Utils } from "../Utils";
import { HealingGroupSkill, JumpAttackSkill, SingleTauntSkill, WindMagicSkill } from "./MainSkill";
import { Node } from "cc";

export const skillIdEnum = {
    taunt: 1,
    jumpAttack: 2,
    healingGroup: 3,
    windMagic: 4,
}

export class MainSkillFactory {
    static createMainSkill(id: number, caster: Mediator, targets: Mediator[], battleFiled: BattleField) {
        switch (id) {
            case skillIdEnum.taunt:
                return new SingleTauntSkill(id, caster, targets);
            case skillIdEnum.jumpAttack:
                return new JumpAttackSkill(id, caster, targets);
            case skillIdEnum.healingGroup:
                const myAlivefishes = Utils.getAliveActors(battleFiled.leftFishes);
                return new HealingGroupSkill(id, caster, myAlivefishes);
            case skillIdEnum.windMagic:
                return new WindMagicSkill(id, caster, targets);
            default:
                break;
        }
    }

}