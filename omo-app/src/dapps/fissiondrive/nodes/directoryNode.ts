import {FsNode} from "./fsNode";
import {tryGetDappState} from "../../../libs/o-os/loader";
import {FissionAuthState} from "../../fissionauth/manifest";
import {FileNode} from "./fileNode";
import {runWithDrive} from "../../../libs/o-fission/initFission";

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
    await runWithDrive(async fissionDrive =>
    {
      const children: FsNode[] = [];

      const childFsNodes = await fissionDrive.fs.ls(this.path);

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
    });
  }
}
