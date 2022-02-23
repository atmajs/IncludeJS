import { arr_invoke } from './utils/array'
import { fn_doNothing } from './utils/fn'

declare var document: any;
declare var window: any;


const readycollection = [];
const supports = typeof document !== 'undefined' && typeof window !== 'undefined';


function onReady() {
    Events.ready = fn_doNothing;

    if (readycollection.length === 0) {
        return;
    }

    arr_invoke(readycollection);
    readycollection.length = 0;
}

function bind () {
    if ('onreadystatechange' in document) {
        document.onreadystatechange = function () {
            if (/complete|interactive/g.test(document.readyState) === false) {
                return;
            }
            onReady();
        };
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        window.onload = onReady;
    }
}

if (supports) {
    bind();
}


export const Events = {
    ready(callback) {
        if (supports === false) {
            callback();
            return;
        }
        readycollection.unshift(callback);
    }
};
