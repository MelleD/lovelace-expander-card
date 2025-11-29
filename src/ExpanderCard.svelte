<script lang="ts" module>
        export const defaults = {
            'gap': '0.0em',
            'expanded-gap': '0.6em',
            'padding': '1em',
            'clear': false,
            'clear-children': false,
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
            'icon-rotate-degree': '180deg',
            'animation': true
        };
        import { loadExpanderCardEditor } from './ExpanderCardEditor';
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
<svelte:options customElement={{
    tag: 'expander-card',
    extend: (customElementConstructor) => class extends customElementConstructor {
        // re-declare props used in customClass.
        public config!: ExpanderConfig;

        public static async getConfigElement() {
            await loadExpanderCardEditor();
            return document.createElement('expander-card-editor');
        }

        public static getStubConfig() {
            return {
                type: 'custom:expander-card',
                title: 'Expander Card',
                cards: []
            };
        }

        public setConfig(conf = {}) {
            this.config = { ...defaults, ...conf };
        };
    }
}}/>

<script lang="ts">
    import type { ExpanderCardDomEventDetail, HaRipple, HomeAssistant } from './types';
    import Card from './Card.svelte';
    import { onMount } from 'svelte';
    import type { ExpanderConfig } from './configtype';
    import type { AnimationState } from './types';
    import { forwardHaptic } from './helpers/forward-haptic';

    const {
        hass,
        preview,
        config = defaults
    }: {hass: HomeAssistant; preview: boolean; config: ExpanderConfig} = $props();

    let touchPreventClick = $state(false);
    let touchPreventClickTimeout: ReturnType<typeof setTimeout> | null = $state(null);
    let open = $state(preview ? true : false);
    let previewState = $state(preview ? true : false);
    let showButtonUsers = $state(true);
    let animationState: AnimationState = $state<AnimationState>('idle');
    let animationTimeout: ReturnType<typeof setTimeout> | null = $state(null);
    let backgroundAnimationDuration = $state(0);
    let titleCardDiv: HTMLElement | null = $state(null);
    let buttonElement: HTMLElement | null = $state(null);
    let ripple: HaRipple | null = $state(null);

    const configId = config['storage-id'];
    const lastStorageOpenStateId = 'expander-open-' + configId;
    const userStyle = `<style>${config.style}</style>`;
    showButtonUsers = preview || (userInList(config['show-button-users']) ?? true);

    $effect(() => {
        if (preview === previewState || preview === undefined) return;
        previewState = preview;
        if (previewState) {
            setOpenState(true);
            showButtonUsers = true;
        } else {
            setDefaultOpenState();
            showButtonUsers = userInList(config['show-button-users']) ?? true;
        }
    });

    function userInList(userList: string[] | undefined): boolean | undefined {
        if (userList === undefined) {
            return undefined;
        }
        return hass?.user?.name !== undefined && userList.includes(hass?.user?.name);
    }

    function setDefaultOpenState() {
        if (userInList(config['start-expanded-users'])) {
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
            } else {
                setOpenState(false);
            }
        }
    }

    function toggleOpen(openState?: boolean) {
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout  = null;
        }
        const newOpenState = openState !== undefined ? openState : !open;
        if (config.animation) {
            animationState = newOpenState ? 'opening' : 'closing';
            if (newOpenState) {
                setOpenState(true);
                animationTimeout = setTimeout(() => {
                    animationState = 'idle';
                    animationTimeout = null;
                }, 350);
            } else {
                animationTimeout = setTimeout(() => {
                    setOpenState(false);
                    animationState = 'idle';
                    animationTimeout = null;
                }, 350);
            }
        } else {
            setOpenState(newOpenState);
            // animation state is always 'idle' if no animation
        }
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
        if (open && backgroundAnimationDuration === 0) {
            backgroundAnimationDuration = 0.35;
        }
    }

    function handleDomEvent(event: Event) {
        const data: ExpanderCardDomEventDetail = (event as CustomEvent).detail?.['expander-card']?.data;
        if (data?.['expander-card-id'] === config['expander-card-id']) {
            if (data.action === 'open' && !open) {
                toggleOpen(true);
            } else if (data.action === 'close' && open) {
                toggleOpen(false);
            } else if (data.action === 'toggle') {
                toggleOpen();
            }
        }
    };

    function cleanup() {
        document.body.removeEventListener('ll-custom', handleDomEvent);
    };

    let touchElement: HTMLElement | undefined;
    let isScrolling = false;
    let startX = 0;
    let startY = 0;
    const touchStart = (event: TouchEvent) => {
        ripple && (ripple.disabled = true);
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

    const touchCancel = () => {
        ripple && (ripple.disabled = false);
        touchElement = undefined;
        isScrolling = false;
    };

    const touchEnd = () => {
        ripple && (ripple.disabled = false);
    };

    const touchEndAction = (event: TouchEvent) => {
        if (!isScrolling && touchElement === event.target && config['title-card-clickable']) {
            forwardHaptic(touchElement, 'light');
            toggleOpen();
            touchPreventClick = true;
            // A touch event may not always be followed by a click event so we set a timeout to reset
            touchPreventClickTimeout = window.setTimeout(() => {
                touchPreventClick = false;
                touchPreventClickTimeout = null;
            }, 100);
            //  A touch event may not always be followed by a click event so we manually control the ripple
            if (ripple) {
                ripple.startPressAnimation();
                ripple.endPressAnimation();
            }
        }
        touchElement = undefined;
        isScrolling = false;
    };

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

        if (preview) {
            setOpenState(true);
        } else {
            setDefaultOpenState();
        }

        document.body.addEventListener('ll-custom', handleDomEvent);

        let touchEventElement: HTMLElement | undefined;
        if (config['title-card-clickable'] && !config['title-card-button-overlay'] && titleCardDiv) {
            touchEventElement = titleCardDiv;
        } else if (buttonElement) {
            touchEventElement = buttonElement;
        }
        if (touchEventElement) {
            touchEventElement.addEventListener('touchstart', touchStart, { passive: true, capture: true });
            touchEventElement.addEventListener('touchmove', touchMove, { passive: true,capture: true });
            touchEventElement.addEventListener('touchcancel', touchCancel, { passive: true, capture: true });
            touchEventElement.addEventListener('touchend', touchEnd, { passive: true, capture: true });
            touchEventElement.addEventListener('touchend', touchEndAction, { passive: false, capture: false });
        }

        return cleanup;
    });

    const buttonClick = (event: MouseEvent) => {
        if (touchPreventClick) {
            event.preventDefault();
            event.stopImmediatePropagation();
            touchPreventClick = false;
            if (touchPreventClickTimeout) {
                clearTimeout(touchPreventClickTimeout);
                touchPreventClickTimeout = null;
            }
            return false;
        }
        forwardHaptic(event.currentTarget as HTMLElement, 'light');
        toggleOpen();
    };
</script>

<ha-card
    class={`expander-card${config.clear ? ' clear' : ''}${open ? ' open' : ' close'} ${animationState}${config.animation ? ' animation ' + animationState : ''}`}
    style="--expander-card-display:{config['expander-card-display']};
     --gap:{open && animationState !=='closing' ? config['expanded-gap'] : config.gap}; --padding:{config.padding};
     --expander-state:{open};
     --icon-rotate-degree:{config['icon-rotate-degree']};
     --card-background:{open && animationState !== 'closing' &&
         config['expander-card-background-expanded'] ?
         config['expander-card-background-expanded'] : config['expander-card-background']};
     --background-animation-duration:{backgroundAnimationDuration}s;
    ">
    {#if config['title-card']}
        <div id='id1' class={`title-card-header${config['title-card-button-overlay'] ?
            '-overlay' : ''}${open ? ' open' : ' close'}${config.animation ?
            ' animation ' + animationState : ''}${config['title-card-clickable'] ? ' clickable' : ''}`}
            onclick={config['title-card-clickable'] && !config['title-card-button-overlay'] ? buttonClick : null}
            role={config['title-card-clickable'] && !config['title-card-button-overlay'] ? 'button' : undefined}
            bind:this={titleCardDiv}
            >
            <div id='id2'
                class={`title-card-container${open ? ' open' : ' close'}${config.animation ? ' animation ' + animationState : ''}`}
                style="--title-padding:{config['title-card-padding'] ? config['title-card-padding'] : '0px'};">
                <Card hass={hass}
                    preview={preview}
                    config={config['title-card']}
                    type={config['title-card'].type}
                    animation={false}
                    open={true}
                    animationState='idle'
                    clearCardCss={config['clear-children']!}
                />
            </div>
            {#if showButtonUsers}
                <button
                    onclick={!config['title-card-clickable'] || config['title-card-button-overlay'] ? buttonClick : null }
                    style="--overlay-margin:{config['overlay-margin']}; --button-background:{config[
                        'button-background'
                    ]}; --header-color:{config['header-color']};"
                    class={`header ${config['title-card-button-overlay'] ?
                        ' header-overlay' : ''}${open ? ' open' : ' close'}${config.animation ? ' animation ' + animationState : ''}`}
                    aria-label="Toggle button"
                    bind:this={buttonElement}
                >
                    <ha-icon style="--arrow-color:{config['arrow-color']}"
                      icon={config.icon}
                      class={`ico${open && animationState !=='closing' ? ' flipped open' : ' close'}${config.animation ? ' animation ' + animationState : ''}`}>
                    </ha-icon>
                    {#if !config['title-card-clickable'] || config['title-card-button-overlay'] }
                    <ha-ripple bind:this={ripple}></ha-ripple>
                    {/if}
                </button>
            {/if}
            {#if config['title-card-clickable'] && !config['title-card-button-overlay'] }
            <ha-ripple bind:this={ripple}></ha-ripple>
            {/if}
        </div>
    {:else}
        {#if showButtonUsers}
            <button onclick={buttonClick}
                class={`header${open ? ' open' : ' close'}${config.animation ? ' animation ' + animationState : ''}`}
                style="--header-width:100%; --button-background:{config['button-background']};--header-color:{config['header-color']};"
                bind:this={buttonElement}
                >
                <div class={`primary title${open ? ' open' : ' close'}`}>{config.title}</div>
                <ha-icon style="--arrow-color:{config['arrow-color']}"
                  icon={config.icon}
                  class={`ico${open && animationState !=='closing' ? ' flipped open' : ' close'}${config.animation ? ' animation ' + animationState : ''}`}>
                </ha-icon>
                <ha-ripple bind:this={ripple}></ha-ripple>
            </button>
        {/if}
    {/if}
    {#if config.cards}
        <div class="children-wrapper {config.animation ? 'animation ' + animationState : ''}{open ? ' open' : ' close'}">
            <div
                style="--expander-card-display:{config['expander-card-display']};
                --gap:{open && animationState !=='closing' ? config['expanded-gap'] : config.gap};
                --child-padding:{open && animationState !=='closing' ? config['child-padding'] : '0px'};"
                class="children-container{open ? ' open' : ' close'}{config.animation ? ' animation ' + animationState : ''}"
            >
                {#each config.cards as card (card)}
                    <Card hass={hass}
                        preview={open && preview}
                        config={card}
                        type={card.type}
                        marginTop={config['child-margin-top']}
                        open={open}
                        animation={config.animation!}
                        animationState={animationState}
                        clearCardCss={config['clear-children']!}
                    />
                {/each}
            </div>
        </div>
    {/if}
    {#if userStyle}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html userStyle}
    {/if}
</ha-card>

<style>
    .expander-card {
        display: var(--expander-card-display,block);
        gap: var(--gap);
        padding: var(--padding);
        background: var(--card-background,#fff);
        -webkit-tap-highlight-color: transparent;
    }
    .expander-card.animation {
        transition: gap 0.35s ease, background-color var(--background-animation-duration, 0) ease;
    }
    .children-wrapper {
        display: flex;
        flex-direction: column;
    }
    .children-wrapper.animation.opening,
    .children-wrapper.animation.closing {
        overflow: hidden;
    }
    .children-container.animation {
        transition: padding 0.35s ease, gap 0.35s ease;
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
        box-shadow: none !important;
    }

    .title-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        position: relative;
    }
    .title-card-header.clickable {
        cursor: pointer;
        border-style: none;
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
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
        padding: 0.85em 0.85em;
        background: var(--button-background);
        border-style: none;
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
        width: var(--header-width,auto);
        color: var(--header-color,#fff);
        cursor: pointer;
        position: relative;
    }
    .header-overlay {
        position: absolute;
        top: 0;
        right: 0;
        margin: var(--overlay-margin);
    }
    .title-card-header-overlay.clickable  > .header-overlay {
        width: calc(100% - var(--overlay-margin) * 2);
        justify-content: flex-end;
    }
    .title-card-header-overlay.clickable > .title-card-container {
        width: calc(100% - var(--overlay-margin) * 2);
    }
    .title {
        width: 100%;
        text-align: left;
    }
    .ico.animation {
        transition-property: transform;
        transition-duration: 0.35s;
    }
    .ico {
        color: var(--arrow-color,var(--primary-text-color,#fff));
    }

    .flipped {
        transform: rotate(var(--icon-rotate-degree,180deg));
    }
</style>
