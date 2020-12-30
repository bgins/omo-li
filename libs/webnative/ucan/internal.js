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
import localforage from 'localforage';
import * as common from '../common';
import * as pathUtil from '../fs/path';
import * as ucan from '../ucan';
import { UCANS_STORAGE_KEY } from '../common';
import { WNFS_PREFIX } from '../ucan';
var dictionary = {};
// FUNCTIONS
/**
 * You didn't see anything 👀
 */
export function clearStorage() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dictionary = {};
                    return [4 /*yield*/, localforage.removeItem(UCANS_STORAGE_KEY)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Lookup the prefix for a filesystem key in the dictionary.
 */
export function dictionaryFilesystemPrefix(username) {
    // const host = `${username}.${setup.endpoints.user}`
    // TODO: Waiting on API change.
    //       Should be `${WNFS_PREFIX}:${host}/`
    return WNFS_PREFIX + ":/";
}
/**
 * Look up a UCAN with a file system path.
 */
export function lookupFilesystemUcan(path) {
    return __awaiter(this, void 0, void 0, function () {
        var pathParts, username, prefix;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathParts = pathUtil.splitParts(path);
                    return [4 /*yield*/, common.authenticatedUsername()];
                case 1:
                    username = _a.sent();
                    prefix = username ? dictionaryFilesystemPrefix(username) : "";
                    if (dictionary["*"]) {
                        return [2 /*return*/, dictionary["*"]];
                    }
                    return [2 /*return*/, pathParts.reduce(function (acc, part, idx) {
                            if (acc)
                                return acc;
                            var partialPath = pathUtil.join(pathParts.slice(0, pathParts.length - idx));
                            return dictionary["" + prefix + partialPath] || null;
                        }, null)];
            }
        });
    });
}
/**
 * Store UCANs and update the in-memory dictionary.
 */
export function store(ucans) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, newList, filteredList, encodedList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, localforage.getItem(UCANS_STORAGE_KEY)];
                case 1:
                    existing = _a.sent();
                    newList = (existing || []).concat(ucans);
                    dictionary = ucan.compileDictionary(newList);
                    filteredList = listFromDictionary();
                    encodedList = filteredList.map(ucan.encode);
                    return [4 /*yield*/, localforage.setItem(UCANS_STORAGE_KEY, encodedList)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * See if the stored UCANs in the in-memory dictionary
 * conform to the given `Permissions`.
 */
export function validatePermissions(_a, username) {
    var app = _a.app, fs = _a.fs;
    var prefix = dictionaryFilesystemPrefix(username);
    // Root access
    var rootUcan = dictionary["*"];
    if (rootUcan && !ucan.isExpired(rootUcan))
        return true;
    // Check permissions
    if (app) {
        var u = dictionary[prefix + "private/Apps/" + app.creator + "/" + app.name];
        if (!u || ucan.isExpired(u))
            return false;
    }
    if (fs && fs.privatePaths) {
        var priv = fs.privatePaths.every(function (pathRaw) {
            var path = pathRaw.replace(/^\/+/, "");
            var pathWithPrefix = path.length ? prefix + "private/" + path : prefix + "private";
            var u = dictionary[pathWithPrefix];
            return u && !ucan.isExpired(u);
        });
        if (!priv)
            return false;
    }
    if (fs && fs.publicPaths) {
        var publ = fs.publicPaths.every(function (pathRaw) {
            var path = pathRaw.replace(/^\/+/, "");
            var pathWithPrefix = path.length ? prefix + "public/" + path : prefix + "public";
            var u = dictionary[pathWithPrefix];
            return u && !ucan.isExpired(u);
        });
        if (!publ)
            return false;
    }
    return true;
}
// ㊙️
function listFromDictionary() {
    return Object.values(dictionary);
}
//# sourceMappingURL=internal.js.map