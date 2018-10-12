import { loadBags } from '../global'

export const LoadBundleParser = {
	process (source, res) {
		var div = document.createElement('div');
		div.innerHTML = source;
		
		loadBags.push(div);
		return source;
	}
};

