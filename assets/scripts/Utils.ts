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
        if(targets && targets.length>0){
            let aliveActors = this.getAliveActors(targets);
            const sortedActors = aliveActors.sort((a, b) => {
                return b.actor.taunt - a.actor.taunt;
            })
    
            if (sortedActors) {
                return sortedActors[0];
            }
        }
    }
}


