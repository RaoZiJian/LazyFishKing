import { BuffNode } from "../BuffNode";
import { Mediator } from "../mediator/Mediator";
import { JumpAttackSkill, SingleTauntSkill } from "./MainSkill";
import { Node } from "cc";

export const skillIdEnum = {
    taunt: 1,
    jumpAttack: 2
}

export class MainSkillFactory {

    static createMainSkill(id: number, caster: Mediator, targets: Mediator[], damageNode: Node, buffNode?: BuffNode) {
        switch (id) {
            case skillIdEnum.taunt:
                return  new SingleTauntSkill(id, caster, targets, damageNode, buffNode);
            case skillIdEnum.jumpAttack:
                return  new JumpAttackSkill(id, caster, targets, damageNode, buffNode);
            default:
                break;
        }
    }

}