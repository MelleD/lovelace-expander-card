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
    import { onMount, untrack } from 'svelte';
    import type { AnimationState, HomeAssistant, HuiCard, LovelaceCardConfig } from './types';
    import { computeCardSize } from './helpers/compute-card-size';

    const {
        config,
        hass,
        preview,
        marginTop ='0px',
        open,
        animation = true,
        animationState,
        clearCardCss = false
    }: {
        config: LovelaceCardConfig;
        hass: HomeAssistant | undefined;
        preview: boolean;
        marginTop?: string;
        open: boolean;
        animation: boolean;
        animationState: AnimationState;
        clearCardCss: boolean;
    } = $props();

    let outerContainer: HTMLElement | null = null;
    let container = $state<HuiCard | null>(null);
    let loading = $state(true);
    let cardHeight = $state(0);
    const cardConfig: LovelaceCardConfig = untrack(() => JSON.parse(JSON.stringify(config)));
    $effect(() => {
        if (container) {
            container.hass = hass;
        }
    });
    $effect(() => {
        if (container && preview !== undefined) {
            container.preview = preview;
        }
    });
    $effect(() => {
        if (container) {
            // do not set hui-card hidden as this prevents it from updating its display
            // card disabled config sets hui-card to correctly update its display
            cardConfig.disabled = !open;
            // eslint-disable-next-line no-underscore-dangle
            container._element?.dispatchEvent(new CustomEvent('card-visibility-changed', { detail: { value: open }, bubbles: true, composed: false }));
        }
    });

    onMount(async () => {
        const el: HuiCard = document.createElement('hui-card') as HuiCard;
        el.hass = hass;
        el.preview = preview;
        // do not set hui-card hidden as this prevents it from updating its display
        // card disabled config sets hui-card to correctly update its display
        cardConfig.disabled = !open;
        el.config = cardConfig;
        el.load();

        // eslint-disable-next-line svelte/no-dom-manipulating
        outerContainer?.appendChild(el);
        container = el;
        loading = false;

        // hui-card will fire card-updated on ll-upgrade which causes some view to reload
        // so we capture ll-upgrade, stop propagation and set hass on the upgraded element ourselves
        container.addEventListener('ll-upgrade', (ev) => {
            ev.stopPropagation();
            // eslint-disable-next-line no-underscore-dangle
            if (container?._element && hass) {
                // eslint-disable-next-line no-underscore-dangle
                container._element.hass = hass;
            }
        }, { capture: true });

        if (clearCardCss) {
            el.style.setProperty('--ha-card-background', 'transparent');
            el.style.setProperty('--ha-card-box-shadow', 'none');
            el.style.setProperty('--ha-card-border-color', 'transparent');
            el.style.setProperty('--ha-card-border-width', '0px');
            el.style.setProperty('--ha-card-backdrop-filter', 'none');
        }

        if (animation) {
            // Start with an estimated height.
            // Update with resize observer once we have the real height.
            // 56px is the height of one card size unit
            cardHeight = await computeCardSize(el) * 56;
            if (outerContainer) {
                cardHeight += window.getComputedStyle(outerContainer).marginTop
                    ? parseFloat(window.getComputedStyle(outerContainer).marginTop)
                    : 0;
            }
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.contentBoxSize) {
                        const contentBoxSize = Array.isArray(entry.contentBoxSize)
                            ? entry.contentBoxSize[0]
                            : entry.contentBoxSize;
                        if (contentBoxSize.blockSize) {
                            cardHeight = contentBoxSize.blockSize;
                            if (container) {
                                cardHeight += window.getComputedStyle(container).marginTop
                                    ? parseFloat(window.getComputedStyle(container).marginTop)
                                    : 0;
                            }
                        }
                    } else if (entry.contentRect) {
                        cardHeight = entry.contentRect.height;
                        if (container) {
                            cardHeight += window.getComputedStyle(container).marginTop
                                ? parseFloat(window.getComputedStyle(container).marginTop)
                                : 0;
                        }
                    }
                }
            });
            resizeObserver.observe(el);
        }
    });

</script>

<div class="outer-container{open ? ' open' : ' close'}{animation ? ' animation ' + animationState : ''}"
  style="--child-card-margin-top: {open ? marginTop : '0px'};{cardHeight ? ` --expander-animation-height: -${cardHeight}px;` : ''}"
  bind:this={outerContainer}>
    {#if loading}
        <span class="loading"> Loading... </span>
    {/if}
</div>


<style>
  .loading {
    padding: 1em;
    display: block;
  }
 .animation :global {
    hui-card {
        display: flex;
        flex-direction: column;
    }
  }
  .outer-container.animation {
    transition: margin-bottom 0.35s ease;
  }
  .outer-container.animation.open,
  .outer-container.animation.opening {
    margin-bottom: inherit;
  }
  .outer-container.animation.close,
  .outer-container.animation.closing {
    margin-bottom: var(--expander-animation-height, -100%);
  }
  .outer-container.animation.opening {
    animation: fadeInOpacity 0.5s forwards ease;
    -webkit-animation: fadeInOpacity 0.5s forwards ease;
  }
  .outer-container.animation.closing {
      animation: fadeOutOpacity 0.5s forwards ease;
      -webkit-animation: fadeOutOpacity 0.5s forwards ease;
  }
  .outer-container > :global(hui-card) {
    margin-top: var(--child-card-margin-top, 0px);
  }
  @keyframes fadeInOpacity {
      0% {
          opacity: 0;
      }
      100% {
          opacity: 1;
      }
  }
  @-webkit-keyframes fadeInOpacity {
      0% {
          opacity: 0;
      }
      100% {
          opacity: 1;
      }
  }
    @keyframes fadeOutOpacity {
      0% {
          opacity: 1;
      }
      100% {
          opacity: 0;
      }
  }
  @-webkit-keyframes fadeOutOpacity {
      0% {
          opacity: 1;
      }
      100% {
          opacity: 0;
      }
  }
</style>
