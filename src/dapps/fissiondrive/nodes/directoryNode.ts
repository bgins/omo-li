import {FsNode} from "./fsNode";
import {tryGetDappState} from "../../../libs/o-os/loader";
import {FissionAuthState} from "../../fissionauth/manifest";
import {FileNode} from "./fileNode";
//import {defaultTimeout} from "libs/webnative/logFormatted";

export class DirectoryNode extends FsNode
{
  type: "directory" = "directory";

  async init() : Promise<void>
  {
    if (!this.title || this.title === "")
    {
      const fissionAuthState = tryGetDappState<FissionAuthState>("omo.fission.auth:1");
      this.title = fissionAuthState.username;
    }
  }

  async onExpand(): Promise<void>
  {
    const fissionAuthState = tryGetDappState<FissionAuthState>("omo.fission.auth:1");
    const children: FsNode[] = [];

    const childFsNodes = await fissionAuthState.fission._fs.ls(this.path);

    for (let childFsNode of Object.values(childFsNodes))
    {
      if (childFsNode.isFile)
      {
        children.push(new FileNode(this, childFsNode.name));
      }
      else
      {
        children.push(new DirectoryNode(this, childFsNode.name));
      }
    }

    this.childNodes = children;
  }
}
