import { createMachine, send } from "xstate";
import { ProcessDefinition } from "src/libs/o-processes/processManifest";
import { strings } from "../../data/strings";
import { OmoEvent } from "../../../../libs/o-events/omoEvent";
import { ProcessContext } from "../../../../libs/o-processes/interfaces/processContext";
import { ProcessArtifact } from "../../../../libs/o-processes/interfaces/processArtifact";
import { setTrustService } from "./services/setTrustService";
import { storePromptResponse } from "../../../../libs/o-processes/actions/storePromptResponse";
import Banner from "../../../../libs/o-views/atoms/Banner.svelte"
import { setError } from "../../../../libs/o-processes/actions/setError";
import { setResult } from "../../../../libs/o-processes/actions/setResult";
import { sendPrompt } from "../../../../libs/o-processes/actions/sendPrompt/sendPrompt";
import { sendInProgressPrompt } from "../../../../libs/o-processes/actions/sendPrompt/sendInProgressPrompt";
import { sendSuccessPrompt } from "../../../../libs/o-processes/actions/sendPrompt/sendSuccessPrompt";
import { sendErrorPrompt } from "../../../../libs/o-processes/actions/sendPrompt/sendErrorPrompt";
import { ethereumAddress } from "../../../../libs/o-processes/artifacts/ethereumAddress";
import { RefreshView } from "../../../../libs/o-events/refreshView";

export interface SetTrustContext extends ProcessContext {
  data: {
    trustReceiver: ProcessArtifact
  }
}

/**
 * Set trust
 */
const str = strings.safe.processes.setTrust;
const processDefinition = () => createMachine<SetTrustContext, OmoEvent>({
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
          nextButtonTitle: "Trust",
          banner: {
            component: Banner,
            data: {
              text: str.bannerTrustRecipient()
            }
          },
          artifacts: {
            ...ethereumAddress("trustReceiver")
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
      entry: sendInProgressPrompt(str.titleWorking),
      invoke: {
        id: 'setTrust',
        src: setTrustService,
        onError: {
          actions: setError,
          target: "error"
        },
        onDone: {
          actions: setResult(str.successMessage),
          target: "success"
        }
      }
    },
    success: {
      entry: [
        sendSuccessPrompt,
        send({
          type: "process.shellEvent",
          payload: new RefreshView("safe.friends")
        })
      ],
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

export const setTrust: ProcessDefinition = {
  name: "setTrust",
  stateMachine: processDefinition
};
