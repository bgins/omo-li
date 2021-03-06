import { createMachine, send } from "xstate";
import { ProcessDefinition } from "src/libs/o-processes/processManifest";
import { OmoEvent } from "../../../../libs/o-events/omoEvent";
import { ProcessContext } from "../../../../libs/o-processes/interfaces/processContext";
import { ProcessArtifact } from "../../../../libs/o-processes/interfaces/processArtifact";
import { storePromptResponse } from "../../../../libs/o-processes/actions/storePromptResponse";
import Banner from "../../../../libs/o-views/atoms/Banner.svelte"
import { setError } from "../../../../libs/o-processes/actions/setError";
import { setProcessResult } from "../../../../libs/o-processes/actions/setProcessResult";
import {sendPrompt, sendShellEvent} from "../../../../libs/o-processes/actions/sendPrompt/sendPrompt";
import { sendInProgressPrompt } from "../../../../libs/o-processes/actions/sendPrompt/sendInProgressPrompt";
import { sendSuccessPrompt } from "../../../../libs/o-processes/actions/sendPrompt/sendSuccessPrompt";
import { sendErrorPrompt } from "../../../../libs/o-processes/actions/sendPrompt/sendErrorPrompt";
import { ethereumAddress } from "../../../../libs/o-processes/artifacts/ethereumAddress";
import {strings} from "../../data/strings";
import {unTrustService} from "../../services/unTrustService";

export interface UnTrustContext extends ProcessContext {
  data: {
    trustReceiver: ProcessArtifact
  }
}

const str = strings.safe.processes.unTrust;
const processDefinition = () => createMachine<UnTrustContext, OmoEvent>({
  initial: "idle",
  states: {
    idle: {
      on: {
        "process.continue": "promptTrustReceiver"
      }
    },
    promptTrustReceiver: {
      entry: sendPrompt((context) => {
        return {
          title: str.titleTrustReceiver(),
          nextButtonTitle: "Revoke trust",
          banner: {
            component: Banner,
            data: {
              text: str.bannerTrustRecipient()
            }
          },
          artifacts: {
            ...ethereumAddress("trustReceiver", null, false, true)
          }
        }
      }),
      on: {
        "process.continue": {
          actions: storePromptResponse,
          target: "setTrust"
        },
        "process.cancel": "stop"
      }
    },
    setTrust: {
      entry: [
        sendInProgressPrompt(str.titleWorking),
        /*sendShellEvent({
          type: "shell.closeModal"
        })*/
      ],
      invoke: {
        id: 'setTrust',
        src: unTrustService,
        onError: {
          actions: setError,
          target: "error"
        },
        onDone: {
          actions: setProcessResult(str.successMessage),
          target: "success"
        }
      }
    },
    success: {
      entry: sendSuccessPrompt,
      on: {
        "process.continue": "stop",
        "process.cancel": "stop"
      },
      after: {
        2000: { target: 'stop' }
      }
    },
    error: {
      entry: sendErrorPrompt,
      on: {
        "process.continue": "stop",
        "process.cancel": "stop"
      }
    },
    stop: {
      type: "final"
    }
  }
}, {
  guards: {
    "isFullyConfigured": (context => !!context.data.trustReceiver && !!context.data.trustReceiver.value)
  }
});

export const unTrust: ProcessDefinition = {
  name: "unTrust",
  stateMachine: processDefinition
};
