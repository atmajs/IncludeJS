import { PathResolver } from "../PathResolver";
import { ResourceType } from '../models/Type'
import { type Resource } from '../Resource';


export declare type Group = {[key in ResourceType]: any};

export function res_groupByType (arr: string[]): Group {
    let pckg = <Group>{}, imax = arr.length, i = -1;

    while (++i < imax) {
        let path = arr[i];
        let type = PathResolver.getType(path);
        append(pckg, type, path);
    }
    return pckg;
};
export function res_setState(res: Resource, state: number) {
    if (typeof res.state === 'number' && res.state >= state) {
        return;
    }
    res.state = state;
}

function append(pckg:Group, type: ResourceType, path: string) {
    let arr = pckg[type];
    if (arr == null) {
        arr = pckg[type] = [];
    }
    arr.push(path);
}
