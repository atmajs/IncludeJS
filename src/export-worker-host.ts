import { parentPort } from 'worker_threads'
import { WorkerHost } from './worker/WorkerHost';

const host = new WorkerHost();

parentPort.on('message', (...args) => {
    host.call(...args);
})
