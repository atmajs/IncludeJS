import { global } from '../global'
import { Resource } from '../Resource';

export const MaskLoader = {
    supports (resource: Resource) {
        return resource.type === 'mask'
    },
	process (response: string, resource: Resource, onComplete){
		let mask = global.mask;
        if (mask == null) {
            mask = global.require('maskjs');
        }
        mask
            .Module
            .registerModule(response, { path: resource.url })
            .done(module => {
                onComplete(module.exports);
            })
            .fail(error => {
                console.error(error);
                onComplete(null);          
            });
	}
};

