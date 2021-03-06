import { CID, FileContent } from '../../ipfs';
import { Links, UpdateCallback } from '../types';
import { Maybe } from '../../common';
import { TreeInfo, TreeHeader, PutDetails } from '../protocol/public/types';
import BaseTree from '../base/tree';
import BareTree from '../bare/tree';
import PublicFile from './PublicFile';
import PublicHistory from './PublicHistory';
declare type ConstructorParams = {
    cid: Maybe<CID>;
    links: Links;
    header: TreeHeader;
};
declare type Child = PublicFile | PublicTree | BareTree;
export declare class PublicTree extends BaseTree {
    children: {
        [name: string]: Child;
    };
    cid: Maybe<CID>;
    links: Links;
    header: TreeHeader;
    history: PublicHistory;
    constructor({ links, header, cid }: ConstructorParams);
    static empty(): Promise<PublicTree>;
    static fromCID(cid: CID): Promise<PublicTree>;
    static fromInfo(info: TreeInfo, cid: CID): Promise<PublicTree>;
    static instanceOf(obj: any): obj is PublicTree;
    createChildTree(name: string, onUpdate: Maybe<UpdateCallback>): Promise<PublicTree>;
    createOrUpdateChildFile(content: FileContent, name: string, onUpdate: Maybe<UpdateCallback>): Promise<PublicFile>;
    putDetailed(): Promise<PutDetails>;
    updateDirectChild(child: PublicTree | PublicFile, name: string, onUpdate: Maybe<UpdateCallback>): Promise<this>;
    removeDirectChild(name: string): this;
    getDirectChild(name: string): Promise<Child | null>;
    get(path: string): Promise<Child | null>;
    getLinks(): Links;
    updateLink(name: string, result: PutDetails): this;
}
export default PublicTree;
