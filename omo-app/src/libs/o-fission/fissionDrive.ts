import FileSystem from "libs/webnative/fs/filesystem";
import { Profiles } from "./directories/profiles";
import { Keys } from "./directories/keys";
import {AuthSucceeded, Continuation, loadFileSystem} from "libs/webnative";
import {CirclesTransactions} from "./directories/circlesTransactions";
import {CirclesTokens} from "./directories/circlesTokens";
import { Offers } from "./directories/offers";
import {SessionLogs} from "./directories/logs";

export class FissionDrive
{
  private readonly _fissionAuth: AuthSucceeded | Continuation;

  get fs() : FileSystem
  {
    return this._fs;
  }
  private _fs: FileSystem;

  get username(): string {
    return this._fissionAuth.username;
  }

  get profiles(): Profiles {
    return this._profiles;
  }
  private _profiles: Profiles;

  get keys(): Keys {
    return this._keys;
  }
  private _keys: Keys;

  get transactions(): CirclesTransactions {
    return this._transactions;
  }
  private _transactions: CirclesTransactions;

  get tokens(): CirclesTokens {
    return this._tokens;
  }
  private _tokens: CirclesTokens;

  get offers(): Offers {
    return this._offers;
  }
  private _offers: Offers;

  get sessionLogs(): SessionLogs {
    return this._sessionLogs;
  }
  private _sessionLogs: SessionLogs;

  constructor(fissionAuth: AuthSucceeded | Continuation)
  {
    this._fissionAuth = fissionAuth;
  }

  async init()
  {
    this._fs = await loadFileSystem(this._fissionAuth.permissions, this._fissionAuth.username);
    this._sessionLogs = new SessionLogs(this._fs);
    this._profiles = new Profiles(this._fs);
    this._keys = new Keys(this._fs);
    this._transactions = new CirclesTransactions(this._fs);
    this._tokens = new CirclesTokens(this._fs);
    this._offers = new Offers(this._fs);
  }
}

export async function withTimeout<T>(operationName:string, func: () => Promise<T>, timeout?:number) : Promise<T>
{
  return new Promise((resolve, reject) =>
  {
    let resolved = false;
    if (timeout)
    {
      setTimeout(() =>
      {
        if (resolved)
        {
          return;
        }
        reject(new Error(`The execution of ${operationName} timed out after ${timeout / 1000} seconds.`));
      }, timeout);
    }

    try {
      func()
        .then(result => {
          resolved = true;
          resolve(result);
        })
        .catch(error => reject(error));
    }
    catch (e)
    {
      reject(e);
    }
  });
}
