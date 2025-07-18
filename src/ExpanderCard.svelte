<script lang="ts" module>
        export const defaults = {
            'gap': '0.0em',
            'expanded-gap': '0.6em',
            'padding': '1em',
            'clear': false,
            'title': ' ',
            'overlay-margin': '0.0em',
            'child-padding': '0.0em',
            'child-margin-top': '0.0em',
            'button-background': 'transparent',
            'expander-card-background': 'var(--ha-card-background,var(--card-background-color,#fff))',
            'header-color': 'var(--primary-text-color,#fff)',
            'arrow-color': 'var(--arrow-color,var(--primary-text-color,#fff))',
            'expander-card-display': 'block',
            'title-card-clickable': false,
            'min-width-expanded': 0,
            'max-width-expanded': 0,
            'icon': 'mdi:chevron-down',
            'border-radius': '0px',
            'border': 'none',
            'icon-rotate-degree': '180deg'
        };
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
<svelte:options customElement={{
    tag: 'expander-card',
    extend: (customElementConstructor) => class extends customElementConstructor {
        // re-declare props used in customClass.
        public config!: ExpanderConfig;

        public setConfig(conf = {}) {
            this.config = { ...defaults, ...conf };
        };
    }
}}/>

<script lang="ts">
    import type { HomeAssistant } from 'custom-card-helpers';
    import Card from './Card.svelte';
    import { onMount } from 'svelte';
    import type { ExpanderConfig } from './configtype';
    import { slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    const {
        hass,
        config = defaults
    }: {hass: HomeAssistant; config: ExpanderConfig} = $props();

    let touchPreventClick = $state(false);
    let open = $state(false);

    const configId = config['storgage-id'];
    const lastStorageOpenStateId = 'expander-open-' + configId;
    const showButtonUsers = (config['show-button-users'] === undefined || config['show-button-users']?.includes(hass?.user.name));


    function toggleOpen() {
        setOpenState(!open);
    }

    function setOpenState(openState: boolean) {
        open = openState;
        if (configId !== undefined) {
            try {
                localStorage.setItem(lastStorageOpenStateId, open ? 'true' : 'false');
            } catch (e) {
                /* eslint no-console: 0 */
                console.error(e);
            }
        }
    }

    onMount(() => {
        const minWidthExpanded = config['min-width-expanded'];
        const maxWidthExpanded = config['max-width-expanded'];
        const offsetWidth = document.body.offsetWidth;

        if (minWidthExpanded && maxWidthExpanded) {
            config.expanded = offsetWidth >= minWidthExpanded && offsetWidth <= maxWidthExpanded;
        } else if (minWidthExpanded) {
            config.expanded = offsetWidth >= minWidthExpanded;
        } else if (maxWidthExpanded) {
            config.expanded = offsetWidth <= maxWidthExpanded;
        }

        if (config['start-expanded-users']?.includes(hass?.user.name)) {
          setOpenState(true);
        } else if (configId !== undefined) {
            try {
                const storageValue = localStorage.getItem(lastStorageOpenStateId);
                if(storageValue === null){
                    // first time, set the state from config
                    if (config.expanded !== undefined) {
                        setOpenState(config.expanded);
                    }
                }
                else {
                    // last state is stored in local storage
                    open = storageValue ? storageValue === 'true' : open;
                }
            } catch (e) {
                console.error(e);
            }
        }else{
            // first time, set the state from config
            if (config.expanded !== undefined) {
                setOpenState(config.expanded);
            }
        }
    });

    const buttonClick = (event: MouseEvent) => {
        if (touchPreventClick) {
            event.preventDefault();
            event.stopImmediatePropagation();
            touchPreventClick = false;
            return false;
        }
        toggleOpen();
    };

    const buttonClickDiv = (event: MouseEvent) => {
        const target = event.currentTarget as HTMLElement | null;
        if (target?.classList.contains('title-card-container')) {
            buttonClick(event);
        }
    };

    let touchElement: HTMLElement | undefined;
    let isScrolling = false;
    let startX = 0;
    let startY = 0;
    const touchStart = (event: TouchEvent) => {
        touchElement = event.target as HTMLElement;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        isScrolling = false;
    };

    const touchMove = (event: TouchEvent) => {
        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        if (Math.abs(currentX - startX) > 10 || Math.abs(currentY - startY) > 10) {
            isScrolling = true;
        }
    };

    const touchEnd = (event: TouchEvent) => {
        if (!isScrolling && touchElement === event.target && config['title-card-clickable']) {
            toggleOpen();
        }
        touchElement = undefined;
        touchPreventClick = true;
    };
</script>

<ha-card
    class={`expander-card${config.clear ? ' clear' : ''}${open ? ' open' : ' close'}`}
    style="--border-radius:{config['border-radius']}; --border{config.border}; --icon-rotate-degree:{config['icon-rotate-degree']}; --expander-card-display:{config['expander-card-display']};
     --gap:{open ? config['expanded-gap'] : config.gap}; --padding:{config.padding};
     --expander-state:{open};
     --card-background:{open && config['expander-card-background-expanded'] ? config['expander-card-background-expanded']: config['expander-card-background']}">
    {#if config['title-card']}
        <div id='id1' class={`title-card-header${config['title-card-button-overlay'] ? '-overlay' : ''}`}>
            <div id='id2' class="title-card-container" style="--title-padding:{config['title-card-padding']}"
                ontouchstart={touchStart} ontouchmove={touchMove} ontouchend={touchEnd}
                onclick={config['title-card-clickable'] ? buttonClickDiv : null}
                role={config['title-card-clickable'] ? 'button' : undefined}>
                <Card hass={hass} config={config['title-card']} type={config['title-card'].type} open={true}/>
            </div>
            {#if showButtonUsers}
                <button onclick={buttonClick}
                    style="--overlay-margin:{config['overlay-margin']}; --button-background:{config[
                        'button-background'
                    ]}; --header-color:{config['header-color']};"
                    class={`header ripple${config['title-card-button-overlay'] ? ' header-overlay' : ''}${open ? ' open' : ' close'}`}
                    aria-label="Toggle button"
                >
                    <ha-icon style="--arrow-color:{config['arrow-color']}" icon={config.icon} class={`ico${open ? ' flipped open' : 'close'}`} ></ha-icon>
                </button>
            {/if}
        </div>
    {:else}
        {#if showButtonUsers}
            <button onclick={buttonClick}
                class={`header${config['expander-card-background-expanded'] ? '' : ' ripple'}${open ? ' open' : ' close'}`}
                style="--header-width:100%; --button-background:{config['button-background']};--header-color:{config['header-color']};"
            >
                <div class={`primary title${open ? ' open' : ' close'}`}>{config.title}</div>
                <ha-icon style="--arrow-color:{config['arrow-color']}" icon={config.icon} class={`ico${open ? ' flipped open' : ' close'}`}></ha-icon>
            </button>
        {/if}
    {/if}
    {#if config.cards}
        <div
            style="--expander-card-display:{config['expander-card-display']};
             --gap:{open ? config['expanded-gap'] : config.gap}; --child-padding:{open ? config['child-padding'] : '0px'};"
            class="children-container"
            transition:slide={{ duration: 500, easing: cubicOut }}
        >
            {#each config.cards as card (card)}
                <Card hass={hass} config={card} type={card.type} marginTop={config['child-margin-top']} open={open}/>
            {/each}
        </div>
    {/if}
</ha-card>

<style>
    .expander-card {
        display: var(--expander-card-display,block);
        gap: var(--gap);
        padding: var(--padding);
        background: var(--card-background,#fff);
        border-radius: var(--border-radius,0px);
        border: var(--border,none);
    }
    .children-container {
        padding: var(--child-padding);
        display: var(--expander-card-display,block);
        gap: var(--gap);
    }
    .clear {
        background: none !important;
        background-color: transparent !important;
        border-style: none !important;
    }
    .title-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
    }
    .title-card-header-overlay {
        display: block;
    }
    .title-card-container {
        width: 100%;
        padding: var(--title-padding);
    }
    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.8em 0.8em;
        margin: 2px;
        background: var(--button-background);
        border-style: none;
        width: var(--header-width,auto);
        color: var(--header-color,#fff);
    }
    .header-overlay {
        position: absolute;
        top: 0;
        right: 0;
        margin: var(--overlay-margin);
    }
    .title {
        width: 100%;
        text-align: left;
    }
    .ico {
        color: var(--arrow-color,var(--primary-text-color,#fff));
        transition-property: transform;
        transition-duration: 0.35s;
    }

    .flipped {
        transform: rotate(var(--icon-rotate-degree,180deg));
    }

    .ripple {
        background-position: center;
        transition: background 0.8s;
        border-radius: 1em;
    }
    .ripple:hover {
        background: #ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%;
    }
    .ripple:active {
        background-color: #ffffff25;
        background-size: 100%;
        transition: background 0s;
    }
</style>
