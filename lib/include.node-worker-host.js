var _src_worker_WorkerHost = {};

// source ./ModuleSimplified.js
var _src_worker_WorkerHost;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_worker_WorkerHost != null ? _src_worker_WorkerHost : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerHost = void 0;
var include = require('./include.node.module.js').include;
var WorkerHost = /** @class */ (function () {
    function WorkerHost() {
    }
    WorkerHost.prototype.call = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('WorkerHost.Message ))', __filename);
                        console.log('>>>>>>>>>>>>>>>>>>>>>', include.instance().include);
                        return [4 /*yield*/, wait(1000)];
                    case 1:
                        _a.sent();
                        if (message.method in this === false) {
                            throw new Error("Method \"".concat(message.method, "\" undefined in host."));
                        }
                        return [2 /*return*/, this[message.method].apply(this, message.args)];
                }
            });
        });
    };
    WorkerHost.prototype.loadScript = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var filename, resource, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filename = opts.filename;
                        resource = include.instance();
                        return [4 /*yield*/, resource
                                .include('js', "".concat(filename, "::Module"), { skipWorker: true })];
                    case 1:
                        resp = _a.sent();
                        console.log('WorkerHost.loadScript', resp);
                        return [2 /*return*/];
                }
            });
        });
    };
    return WorkerHost;
}());
exports.WorkerHost = WorkerHost;
function wait(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_worker_WorkerHost === module.exports) {
        // do nothing if
    } else if (__isObj(_src_worker_WorkerHost) && __isObj(module.exports)) {
        Object.assign(_src_worker_WorkerHost, module.exports);
    } else {
        _src_worker_WorkerHost = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
var WorkerHost_1 = _src_worker_WorkerHost;
var host = new WorkerHost_1.WorkerHost();
worker_threads_1.parentPort.on('message', function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    host.call.apply(host, args);
});

