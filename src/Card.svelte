<!--
/*
Copyright 2021-2022 Peter Repukat - FlatspotSoftware
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
-->
<!-- eslint-disable-next-line svelte/valid-compile -->
<svelte:options customElement='expander-sub-card' />

<script lang="ts">
    import type { LovelaceCard, HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';
    import { getCardUtil } from './cardUtil.svelte';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';

    const {
        type = 'div',
        config,
        hass,
        marginTop ='0px'
    }: { type?: string; config: LovelaceCardConfig; hass: HomeAssistant | undefined; marginTop?: string} = $props();


    let container = $state<LovelaceCard>();
    let loading = $state(true);
    $effect(() => {
        if (container) {
            container.hass = hass;
        }
    });

    onMount(async () => {
        const util = await getCardUtil();
        const el = util.createCardElement(config);
        el.hass = hass;

        if (!container) {
            return;
        }
        // eslint-disable-next-line svelte/no-dom-manipulating
        container.replaceWith(el);
        container = el;
        loading = false;
    });
</script>

<div class="outer-container" style="margin-top: {marginTop};">
    <svelte:element this={type} bind:this={container} transition:slide|local />
    {#if loading}
        <span class="loading"> Loading... </span>
    {/if}
</div>


<style>
  .loading {
    padding: 1em;
    display: block;
  }
</style>
