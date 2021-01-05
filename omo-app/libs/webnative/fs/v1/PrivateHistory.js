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
import * as protocol from '../protocol';
var PrivateHistory = /** @class */ (function () {
    function PrivateHistory(node) {
        this.node = node;
    }
    /**
     * Go back one or more versions.
     *
     * @param delta Optional negative number to specify how far to go back
     */
    PrivateHistory.prototype.back = function (delta) {
        var _a;
        if (delta === void 0) { delta = -1; }
        return __awaiter(this, void 0, void 0, function () {
            var n, revision, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        n = Math.min(delta, -1);
                        revision = (_a = this.node.header) === null || _a === void 0 ? void 0 : _a.revision;
                        _b = revision;
                        if (!_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getRevision(revision + n)];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2: return [2 /*return*/, (_b) || null];
                }
            });
        });
    };
    // async forward(delta: number = 1): Promise<Maybe<Node>> {
    //   const n = Math.max(delta, 1)
    //   const revision = this.node.header?.revision
    //   return (revision && await this._getRevision(revision + n)) || null
    // }
    /**
     * Get a version before a given timestamp.
     *
     * @param timestamp Unix timestamp in seconds
     */
    PrivateHistory.prototype.prior = function (timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.node.header.metadata.unixMeta.mtime < timestamp) {
                    return [2 /*return*/, this.node];
                }
                else {
                    return [2 /*return*/, this._prior(this.node.header.revision - 1, timestamp)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * List earlier versions along with the timestamp they were created.
     */
    PrivateHistory.prototype.list = function (amount) {
        if (amount === void 0) { amount = 5; }
        return __awaiter(this, void 0, void 0, function () {
            var max;
            var _this = this;
            return __generator(this, function (_a) {
                max = this.node.header.revision;
                return [2 /*return*/, Promise.all(Array.from({ length: amount }, function (_, i) {
                        var n = i + 1;
                        return _this._getRevisionInfoFromNumber(max - n).then(function (info) { return ({
                            revisionInfo: info,
                            delta: -n
                        }); });
                    })).then(function (list) { return list.filter(function (a) { return !!a.revisionInfo; }); }).then(function (list) { return list.map(function (a) {
                        var mtime = a.revisionInfo.metadata.unixMeta.mtime;
                        return { delta: a.delta, timestamp: mtime };
                    }); })];
            });
        });
    };
    /**
     * @internal
     */
    PrivateHistory.prototype._getRevision = function (revision) {
        return __awaiter(this, void 0, void 0, function () {
            var info, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._getRevisionInfoFromNumber(revision)];
                    case 1:
                        info = _b.sent();
                        _a = info;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.node.constructor.fromInfo(this.node.mmpt, this.node.key, info)];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3: return [2 /*return*/, _a];
                }
            });
        });
    };
    /**
     * @internal
     */
    PrivateHistory.prototype._getRevisionInfo = function (revision) {
        return protocol.priv.readNode(revision.cid, this.node.key);
    };
    /**
     * @internal
     */
    PrivateHistory.prototype._getRevisionInfoFromNumber = function (revision) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, key, mmpt, bareNameFilter, r;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.node, key = _a.key, mmpt = _a.mmpt;
                        bareNameFilter = this.node.header.bareNameFilter;
                        return [4 /*yield*/, protocol.priv.getRevision(mmpt, bareNameFilter, key, revision)];
                    case 1:
                        r = _b.sent();
                        return [2 /*return*/, r && this._getRevisionInfo(r)];
                }
            });
        });
    };
    /**
     * @internal
     */
    PrivateHistory.prototype._prior = function (revision, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getRevisionInfoFromNumber(revision)];
                    case 1:
                        info = _a.sent();
                        if (!(info === null || info === void 0 ? void 0 : info.revision))
                            return [2 /*return*/, null];
                        if (info.metadata.unixMeta.mtime < timestamp) {
                            return [2 /*return*/, this._getRevision(info.revision)];
                        }
                        else {
                            return [2 /*return*/, this._prior(info.revision - 1, timestamp)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return PrivateHistory;
}());
export default PrivateHistory;
//# sourceMappingURL=PrivateHistory.js.map