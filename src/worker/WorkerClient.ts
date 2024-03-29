import { global } from '../global'
import { Worker } from 'worker_threads'
import { IWorkerMessage } from './IWorkerMessage';


export class WorkerWrapper {

    worker: WorkerClientNode

    constructor (workerFilename?: string) {
        this.worker = new WorkerClientNode(workerFilename);
    }

    async loadScript (filename: string) {
        let scriptExportsMeta = await this.worker.call('loadScript', {
            filename
        });
        console.log('scriptExportsMeta', scriptExportsMeta);
        return WorkerRpcProxyUtils.wrapExportsMeta(this, filename, scriptExportsMeta);
    }
    async call(filename: string, accessorPath: string, ...args) {
        return await this.worker.call('call', {
            method: accessorPath,
            args: args
        });
    }
}

interface IExportsMeta {
    [key: string]: {
        type: 'class' | 'function' | 'object',

        klass?: {
            proto?: IExportsMeta
            statics?: IExportsMeta
        }

        object?: IExportsMeta
    }
}

namespace WorkerRpcProxyUtils {
    export function wrapExportsMeta (worker: WorkerWrapper, filename: string, scriptExportsMeta: IExportsMeta) {
        return createObject(worker, filename, null, scriptExportsMeta)
    }
    function createMethod (worker: WorkerWrapper, filename: string, accessorPath: string) {
        return async function (...args) {
            return await worker.call(filename, accessorPath, ...args);
        };
    }
    function createClass(worker: WorkerWrapper, filename: string, accessorPath: string) {
        throw new Error('Class RPC Not implemented yet');
    }
    function createObject(worker: WorkerWrapper, filename: string, accessorPath: string, exports: IExportsMeta) {
        let obj = {};
        for (let key in exports) {
            let exp = exports[key];
            let path = accessorPath ? `${accessorPath}.${key}` : key;
            if (exp.type === 'function') {
                obj[key] = createMethod(worker, filename, path);
                continue;
            }
            if (exp.type === 'class') {
                obj[key] = createClass(worker, filename, key);
                continue;
            }
            if (exp.type === 'object') {
                obj[key] = createObject(worker, filename, key, exp.object);
                continue;
            }
            throw new Error(`Exported type is unsupported`);
        }
        return obj;
    }
}

export class WorkerClientNode {

    child: Worker
    timeoutMs: number
    awaiters: { [id: string]: { promise: DfrWrapped, timestamp } } = Object.create(null)

    constructor (workerFilename?: string) {

        const { Worker } = global.require('worker_threads');

        let cwd = process.cwd();
        let host = `include.node-worker-host.js`;
        let isDev = /(include|includejs)$/.test(cwd);

        let path = workerFilename ?? (isDev ? `${cwd}/lib/${host}` : `${cwd}/node_modules/includejs/lib/${host}`);
        this.child = new Worker(path);

        this.child.on('message', (resp: { id, data?, error? }) => {
            if (resp.id == null || resp.id in this.awaiters === false) {
                return;
            }
            let awaiter = this.awaiters[resp.id];
            delete this.awaiters[resp.id];
            if (resp.error) {
                awaiter.promise.reject(resp.error);
                return;
            }
            awaiter.promise.resolve(resp.data);
        });
    }


    call<T = any>(method: string, ...args): Promise<T> {
        console.log('CALLING', method);
        let promise = new DfrWrapped;
        let id = (Math.round(Math.random() * 10 ** 10)) + '' + Date.now();
        this.awaiters[id] = {
            timestamp: Date.now(),
            promise
        };

        this.child.postMessage( <IWorkerMessage> {
            id,
            method,
            args
        });
        if (this.timeoutMs) {
            setTimeout(() => this.checkTimeout(), this.timeoutMs);
        }
        return promise.promise;
    }

    checkTimeout () {
        let now = Date.now();
        let keys = [];
        for (let key in this.awaiters) {
            let bin = this.awaiters[key];
            let ms = now - bin.timestamp;
            if (ms >= this.timeoutMs) {
                try {
                    bin.promise.reject(new Error('Timeouted'));
                } catch (error) { }
                keys.push(key);
            }
        }
        keys.forEach(key => delete this.awaiters[key]);
    }

    onError (error) {
        let obj = Object.create(this.awaiters);
        this.awaiters = {};

        for (let key in obj) {
            let bin = obj[key];
            try {
                bin.promise.reject(error);
            } catch (error) { }
        }
    }
    onStdError (str: string) {
        this.onError(new Error(str));
    }
}


class DfrWrapped<T = any> {
    resolve
    reject
    promise: Promise<T>

    constructor () {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        })
    }
}
