var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BehaviorSubject } from "rxjs";
import { setDappState, tryGetDappState } from "../../../libs/o-os/loader";
import { DelayedTrigger } from "../../../libs/o-os/delayedTrigger";
import { CirclesToken } from "../../../libs/o-circles-protocol/model/circlesToken";
import { CirclesAccount } from "../../../libs/o-circles-protocol/model/circlesAccount";
import { BlockIndex } from "../../../libs/o-os/blockIndex";
import { ProgressSignal } from "../../../libs/o-circles-protocol/interfaces/blockchainEvent";
import { runWithDrive } from "../../../libs/o-fission/initFission";
const myKnownTokensSubject = new BehaviorSubject({
    payload: {}
});
const blockIndex = new BlockIndex();
const myKnownTokens = {};
const storeToCacheTrigger = new DelayedTrigger(500, () => __awaiter(void 0, void 0, void 0, function* () {
    yield runWithDrive((fissionDrive) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const existingKnownTokensList = (_a = (yield fissionDrive.tokens.tryGetByName("tokens"))) !== null && _a !== void 0 ? _a : {
            name: "tokens",
            entries: {}
        };
        const existingKnownTokens = existingKnownTokensList.entries;
        Object.values(myKnownTokens).forEach(token => {
            existingKnownTokens[token.tokenAddress] = {
                name: token.tokenAddress,
                noTransactionsUntilBlockNo: token.noTransactionsUntilBlockNo,
                createdInBlockNo: token.createdInBlockNo,
                tokenAddress: token.tokenAddress,
                tokenOwner: token.tokenOwner
            };
        });
        existingKnownTokensList.entries = existingKnownTokens;
        yield fissionDrive.tokens.addOrUpdate(existingKnownTokensList);
    }));
}));
const updateTrigger = new DelayedTrigger(30, () => __awaiter(void 0, void 0, void 0, function* () {
    const current = myKnownTokensSubject.getValue();
    myKnownTokensSubject.next({
        payload: myKnownTokens,
        signal: current.signal
    });
    storeToCacheTrigger.trigger();
}));
export function initMyKnownTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runWithDrive((fissionDrive) => __awaiter(this, void 0, void 0, function* () {
            const safeState = tryGetDappState("omo.safe:1");
            const circlesAccount = new CirclesAccount(safeState.mySafeAddress);
            try {
                const existingKnownTokensList = yield fissionDrive.tokens.tryGetByName("tokens");
                if (existingKnownTokensList) {
                    const existingKnownTokens = existingKnownTokensList.entries;
                    Object.values(existingKnownTokens).forEach(cachedToken => {
                        const token = new CirclesToken(safeState.mySafeAddress);
                        token.createdInBlockNo = cachedToken.createdInBlockNo;
                        token.tokenAddress = cachedToken.tokenAddress;
                        token.tokenOwner = cachedToken.tokenOwner;
                        token.noTransactionsUntilBlockNo = cachedToken.noTransactionsUntilBlockNo;
                        myKnownTokens[token.tokenOwner] = token;
                    });
                    const current = myKnownTokensSubject.getValue();
                    myKnownTokensSubject.next({
                        payload: myKnownTokens,
                        signal: current === null || current === void 0 ? void 0 : current.signal
                    });
                }
            }
            catch (e) {
                window.o.publishEvent(new ProgressSignal("omo.safe:1:initialize", "Loading your contacts' tokens (failed) ..", 0));
            }
            // Update the token list whenever the contact list changes.
            // Don't subscribe to the events since Signup events happen only one time per safe.
            safeState.myContacts.subscribe((contactList) => __awaiter(this, void 0, void 0, function* () {
                const newContacts = contactList.payload.filter(contact => !myKnownTokens[contact.safeAddress]);
                const newTokens = yield circlesAccount.tryGetTokensBySafeAddress(newContacts.map(o => o.safeAddress));
                newTokens.forEach(token => {
                    blockIndex.addBlock(token.createdInBlockNo);
                    myKnownTokens[token.tokenOwner] = token;
                });
                updateTrigger.trigger();
            }));
            setDappState("omo.safe:1", existing => {
                return Object.assign(Object.assign({}, existing), { myKnownTokens: myKnownTokensSubject });
            });
        }));
    });
}
