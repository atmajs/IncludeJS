import { Config, cfg } from './Config'
import { Helper } from './Helper'
import { refs } from './global'
import { type Resource } from './Resource';
import { res_setState } from './utils/res';
import { class_Dfr } from './utils/class_Dfr';
import { State } from './models/State';

declare var global: any;

let head: HTMLHeadElement;
let currentResource: Resource;
let stack: Resource[] = [];
let completeAllCbs: Function[] = [];
let isPaused = false;


namespace Loaders {
    export function ensureType (resource: Resource) {
        let loaderType = resource.loaderType;
        if (loaderType == null) {
            if (!cfg.eval) {
                loaderType = 'embed';
            } else {
                loaderType = 'eval';
            }
            resource.loaderType = loaderType;
        }
        return loaderType;
    }
    export async function byEmbed (resource: Resource, callback) {
        let url = resource.url;
        if (cfg.version) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
        }
        if (url[0] === '/' && cfg.lockedToFolder === true) {
            url = url.substring(1);
        }

        let tag = document.createElement('script');
        tag.type = 'text/javascript';
        tag.src = url;

        if ('onreadystatechange' in tag) {
            (<any>tag).onreadystatechange = function () {
                if (this.readyState === 'complete' || this.readyState === 'loaded') {
                    callback();
                }
            };
        } else {
            tag.onload = tag.onerror = callback;
        }
        if (head == null) {
            head = document.getElementsByTagName('head')[0];
        }
        head.appendChild(tag);
    }
    export function byEval (resource: Resource, callback) {
        SourceLoader.load(resource, () => {
            currentResource = resource;
            currentResource.state = cfg.sync ? 3 : 1;
            global.include = resource;

            refs.evaluate(resource.source, resource);
            callback();
        });
    }
    export function byImport (resource: Resource, callback) {

        import(resource.url).then(
            result => {
                if (cfg.esModuleInterop) {
                    result = {
                        __esModule: true,
                        ...(result ?? {})
                    };
                }
                resource.exports = result;
                resource.response = result;
                callback();
            },
            error => {
                console.error('Not Loaded:', resource.url, error?.message);
                console.error('- Initiator:', resource.parent?.url ?? '<root resource>');

                resource.error = error;
                callback();
            }
        )
    }
}


function stackRemove(resource) {
    var imax = stack.length,
        i = -1;
    while (++i < imax) {
        if (stack[i] === resource) {
            stack.splice(i, 1);
            return;
        }
    }
}


function trigger_complete() {
    if (completeAllCbs.length === 0) {
        return;
    }
    let arr = completeAllCbs;
    completeAllCbs = [];

    for (let i = 0; i < arr.length; i++) {
        arr[i]();
    }
}

function tickStack () {
    if (isPaused) {
        return;
    }
    if (stack.length === 0) {
        trigger_complete();
        return;
    }
    if (currentResource != null) {
        return;
    }
    let resource = stack[0];
    if (resource.state === State.AllCompleted) {
        onResourceLoaded(resource);
        return;
    }

    currentResource = resource;
    currentResource.state = 1;
    global.include = resource;

    let loaderType = resource.loaderType;

    if (loaderType === 'embed') {
        Loaders.byEmbed(resource, () => onResourceLoaded(resource));
        return;
    }
    if (loaderType === 'eval') {
        Loaders.byEval(resource, () => onResourceLoaded(resource));
        return;
    }
    if (loaderType === 'import') {
        Loaders.byImport(resource, () => onResourceLoaded(resource));
        return;
    }
    throw new Error(`Invalid type ${loaderType}`);
}
function onResourceLoaded (resource: Resource) {
    stackRemove(resource);

    if (resource.state !== 2.5) {
        resource.readystatechanged(3);
    }
    currentResource = null;
    tickStack();
}

export const ScriptStack = {
    load(resource, parent) {

        let loaderType = Loaders.ensureType(resource);
        if (loaderType === 'eval') {
            SourceLoader.prefetch(resource);
            if (cfg.sync === true) {
                Loaders.byEval(resource, () => {
                    resource.readystatechanged(3);
                });
                tickStack();
                return;
            }
        }
        ScriptStack.add(resource, parent);
        tickStack();
    },

    add(resource, parent) {

        if (resource.priority === 1) {
            stack.unshift(resource);
            return;
        }
        if (parent == null) {
            stack.push(resource);
            return;
        }
        let imax = stack.length;
        let i = -1;
        // move close to parent
        while (++i < imax) {
            if (stack[i] === parent) {
                stack.splice(i, 0, resource);
                return;
            }
        }

        // was still not added
        stack.push(resource);
    },

    /* Move resource in stack close to parent */
    moveToParent(resource, parent) {
        var length = stack.length,
            parentIndex = -1,
            resourceIndex = -1,
            i;

        for (i = 0; i < length; i++) {
            if (stack[i] === resource) {
                resourceIndex = i;
                break;
            }
        }

        if (resourceIndex === -1) {
            return;
        }

        for (i = 0; i < length; i++) {
            if (stack[i] === parent) {
                parentIndex = i;
                break;
            }
        }

        if (parentIndex === -1) {
            return;
        }

        if (resourceIndex < parentIndex) {
            return;
        }

        stack.splice(resourceIndex, 1);
        stack.splice(parentIndex, 0, resource);
    },

    pause() {
        isPaused = true;
    },

    resume() {
        isPaused = false;

        if (currentResource != null)
            return;

        this.touch();
    },

    touch() {
        tickStack();
    },

    complete(callback) {
        if (isPaused !== true && stack.length === 0) {
            callback();
            return;
        }

        completeAllCbs.push(callback);
    }
};

namespace SourceLoader {
    const progress = [];
    export function prefetch (resource: Resource) {
        load(resource);
    }
    export function load(resource: Resource, callback?: (res?: Resource) => void) {
        if (resource.source) {
            if (resource.state <= 2) {
                resource.state = 2;
            }
            callback?.();
        }
        let dfr = doLoad(resource);
        if (callback) {
            dfr.then(source => {
                resource.source = source;
                res_setState(resource, 2);
                delete progress[resource.url];
                callback(resource);
            }, err => {
                throw err;
            });
        }
    }

    function doLoad (resource: Resource) {
        let dfr = progress[resource.url];
        if (dfr) {
            return dfr;
        }
        dfr = progress[resource.url] = new class_Dfr();

        Helper.XHR(resource, function (resource, response) {
            if (!response) {
                console.error('Not Loaded:', resource.url);
                console.error('- Initiator:', resource.parent?.url ?? '<root resource>');

                if (resource.error) {
                    console.error(resource.error);
                }
            }
            dfr.resolve(response);
        });
        return dfr;
    }
}
