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
<svelte:options tag="expander-sub-card" />

<script lang="ts">
    import type { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';
    import { cardUtil } from './cardUtil';

    export let type = 'div';
    export let marginTop ='0px';
    export let config: LovelaceCardConfig;
    // fix for #199
    // eslint-disable-next-line no-undef-init
    export let hass: HomeAssistant | undefined = undefined;


    let loading = true;
    const uplift = (
        node: HTMLElement,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p: { marginTop: string; type: string; hassParent: HomeAssistant | undefined}
    ) => ({
        // eslint-disable-next-line no-shadow
        update: (p: { marginTop: string; type: string; hassParent: HomeAssistant}) => {
            if (node) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((node.firstChild as any)?.tagName) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (node.firstChild as any).hass = p.hassParent;
                    return;
                }
                void (async () => {
                    const el = (await cardUtil).createCardElement(config);
                    el.hass = p.hassParent;
                    node.setAttribute('style', 'margin-top: ' + p.marginTop + ';');
                    node.innerHTML = '';
                    node.appendChild(el);
                    loading = false;
                })();
            }
        }
    });
</script>

<div use:uplift={{ marginTop: marginTop, type: type, hassParent: hass }} />
{#if loading}
    <span style={'padding: 1em; display: block; '}> Loading... </span>
{/if}

<style>
</style>
