import { global } from '../global'
import { Resource } from '../Resource';
import { WorkerWrapper } from './WorkerClient';

export class WorkerLoader {
    supports (url: string) {
        return /\.worker\./i.test(url);
    }
    process (exports, resource, onComplete) {
        console.log('WorkerLoader.process');
    }
    async load (resource: Resource, onComplete){
        console.log('WorkerLoader.load', resource.url)
        let client = new WorkerWrapper();

        let exports = await client.loadScript(resource.url);
        console.log('LOADED', exports);
        onComplete(exports, resource);
    }
};
