import {faComments} from "@fortawesome/free-solid-svg-icons";
import {DappManifest} from "../../libs/o-os/interfaces/dappManifest";

export interface OmoTalkState {}
export const omotalk : DappManifest<OmoTalkState,OmoTalkState> = {
  id: "omo.talk:1",
  dependencies: [],
  isHidden: false,
  icon: faComments,
  title: "Talk",
  routeParts: ["omoli"],
  tag: Promise.resolve("soon"),
  isEnabled: false,
  pages: []
};
