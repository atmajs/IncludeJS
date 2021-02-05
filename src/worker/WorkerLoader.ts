import { global } from '../global'
import { Resource } from '../Resource';

export const WorkerLoader = {
    supports (resource: Resource) {
        return /\.worker\./i.test(resource.url);
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
