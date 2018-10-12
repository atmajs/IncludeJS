import { PathResolver } from "../PathResolver";
import { ResourceType } from '../models/Type'


export declare type Group = {[key in ResourceType]: any};

export function res_groupByType (arr): Group {
	var pckg = <Group>{}, imax = arr.length, i = -1;

	while (++i < imax) {
		var path = arr[i];
		var type = PathResolver.getType(path);
		append(pckg, type, path);
	}
	return pckg;
};
function append(pckg:Group, type: ResourceType, path: string) {
	var arr = pckg[type];
	if (arr == null) {
		arr = pckg[type] = [];
	}
	arr.push(path);
}