<script lang="ts">
  import NavItem from "../atoms/NavItem.svelte";
  import { location, push } from "svelte-spa-router";
  import { createEventDispatcher } from "svelte";
  import Compose from "../atoms/Compose.svelte";
  import Icon from "fa-svelte";

  import { faPlus } from "@fortawesome/free-solid-svg-icons";
  import {QuickAction} from "../../o-os/types/quickAction";

  const dispatch = createEventDispatcher();
  export let quickActions: QuickAction[] = [];

  function onActionButtonClick() {
    dispatch("actionButtonClick");
  }

  function isActive(action: QuickAction) {
    if (!action || !action.route) return;

    return action.route.indexOf($location) > -1;
  }
</script>

<style global>
  :global(a.active) {
    color: #0d49a3;
  }
</style>

<Compose
  rows="1fr"
  columns="1fr"
  tw="bg-white border-t border-light-200 text-light-400 h-20 w-full mt-0.5 md:border md:border-light-200 md:rounded-t-xl">
  <Compose rows="1fr" columns="1fr" tw="w-full max-w-4xl mx-auto">
    <Compose columns="1fr" rows="1fr" tw="w-full">
      <Compose
        rows="1fr"
        columns="1fr 1fr 80px 1fr 1fr"
        tw="w-full px-2 md:px-0 flex items-center">
        <a
          href={quickActions[0].route}
          class:active={isActive(quickActions[0])}
          class="mx-auto">
          <NavItem mapping={quickActions[0].mapping} />
        </a>

        <a
          href={quickActions[1].route}
          class:active={isActive(quickActions[1])}
          class="mx-auto">
          <NavItem mapping={quickActions[1].mapping} />
        </a>

        <button
          on:click={onActionButtonClick}
          class="w-16 h-16 mx-auto text-white rounded-full action bg-secondary hover:bg-secondary-lighter">
          <div class="flex items-center justify-center">
            <Icon icon={faPlus} class="text-3xl" />
          </div>
        </button>

        <a
          href={quickActions[2].route}
          class:active={isActive(quickActions[2])}
          class="mx-auto">
          <NavItem mapping={quickActions[2].mapping} />
        </a>

        <a
          href={quickActions[3].route}
          class:active={isActive(quickActions[3])}
          class="mx-auto">
          <NavItem mapping={quickActions[3].mapping} />
        </a>
      </Compose>
    </Compose>
  </Compose>
</Compose>
