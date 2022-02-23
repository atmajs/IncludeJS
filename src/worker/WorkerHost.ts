import { IWorkerMessage } from './IWorkerMessage';

const { include } = require('./include.node.module.js');



export class WorkerHost {

    async call (message: IWorkerMessage) {
        console.log('WorkerHost.Message ))', __filename);
        console.log('>>>>>>>>>>>>>>>>>>>>>', include.instance().include);
        await wait(1_000);

        if (message.method in this === false) {
            throw new Error(`Method "${message.method}" undefined in host.`)
        }
        return this[message.method](...message.args);
    }

    protected async loadScript (opts: { filename: string }) {
        let filename = opts.filename;
        let resource = include.instance();

        let resp = await resource
            .include('js', `${filename}::Module`, { skipWorker: true });

        console.log('WorkerHost.loadScript', resp);
    }
}

function wait (ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
