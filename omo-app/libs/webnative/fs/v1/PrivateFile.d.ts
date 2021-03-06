import BaseFile from '../base/file';
import MMPT from '../protocol/private/mmpt';
import PrivateHistory from './PrivateHistory';
import { FileContent } from '../../ipfs';
import { PrivateName, BareNameFilter } from '../protocol/private/namefilter';
import { PrivateAddResult, PrivateFileInfo } from '../protocol/private/types';
declare type ConstructorParams = {
    content: FileContent;
    key: string;
    header: PrivateFileInfo;
    mmpt: MMPT;
};
export declare class PrivateFile extends BaseFile {
    header: PrivateFileInfo;
    history: PrivateHistory;
    key: string;
    mmpt: MMPT;
    constructor({ content, mmpt, key, header }: ConstructorParams);
    static instanceOf(obj: any): obj is PrivateFile;
    static create(mmpt: MMPT, content: FileContent, parentNameFilter: BareNameFilter, key: string): Promise<PrivateFile>;
    static fromName(mmpt: MMPT, name: PrivateName, key: string): Promise<PrivateFile>;
    static fromInfo(mmpt: MMPT, key: string, info: PrivateFileInfo): Promise<PrivateFile>;
    getName(): Promise<PrivateName>;
    updateParentNameFilter(parentNameFilter: BareNameFilter): Promise<this>;
    updateContent(content: FileContent): Promise<this>;
    putDetailed(): Promise<PrivateAddResult>;
}
export default PrivateFile;
