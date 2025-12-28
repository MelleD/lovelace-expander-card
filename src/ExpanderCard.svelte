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
    import { onMount, untrack } from 'svelte';
    import type { ExpanderCardTemplates, ExpanderConfig, ExpanderCardRawConfig } from './configtype';
    import type { AnimationState } from './types';
    import { forwardHaptic } from './helpers/forward-haptic';
    import { isJSTemplate, getJSTemplateRenderer, trackJSTemplate, setJSTemplateRef } from './helpers/templates';
    import type { HomeAssistantJavaScriptTemplatesRenderer } from 'home-assistant-javascript-templates';
    import { getDashboardRawConfig } from './helpers/raw-config';

    const {
        hass,
        preview,
        config = defaults
    }: {hass: HomeAssistant; preview: boolean; config: ExpanderConfig} = $props();

    let touchPreventClick = $state(false);
    let touchPreventClickTimeout: ReturnType<typeof setTimeout> | null = $state(null);

    let open = $state(untrack(() => preview) ? true : false);
    let previewState = $state(untrack(() => preview) ? true : false);
    let showButtonUsers = $state(true);
    let animationState: AnimationState = $state<AnimationState>('idle');
    let animationTimeout: ReturnType<typeof setTimeout> | null = $state(null);
    let backgroundAnimationDuration = $state(0);
    let overlayHeight = $state(0);
    let expanderCard: HTMLElement | null = $state(null);
    let titleCardDiv: HTMLElement | null = $state(null);
    let buttonElement: HTMLElement | null = $state(null);
    let ripple: HaRipple | null = $state(null);
    const variableRenders: Record<string, Promise<(() => void)>> = {};
    const templateRenderers: Record<string, Promise<(() => void)>> = {};
    const templateValues: Record<string, unknown> = $state({});
    let dashboardRawConfig: ExpanderCardRawConfig = $state( getDashboardRawConfig() );

    const userStyleTemplateOrConfig: string | null = $derived(templateValues.style !== undefined ?
        `<style>${String(templateValues.style)}</style>` :
        (config.style ? `<style>${config.style}</style>` : null));
    const iconConfigOrTemplate: string | undefined = $derived(
        templateValues.icon !== undefined ?
            String(templateValues.icon) :
            config.icon);
    const titleConfigOrTemplate: string | undefined = $derived(
        templateValues.title !== undefined ?
            String(templateValues.title) :
            config.title);
    const arrowColorConfigOrTemplate: string | undefined = $derived(
        templateValues['arrow-color'] !== undefined ?
            String(templateValues['arrow-color']) :
            config['arrow-color']);
    const configId = untrack(() => config['storage-id']);
    const lastStorageOpenStateId = 'expander-open-' + configId;
    showButtonUsers = untrack(() => preview || (userInList(config['show-button-users']) ?? true));

    $effect(() => {
        // effect for template 'expanded'. We untrack preview and open to avoid infinite loop effect loops.
        if (templateValues.expanded === undefined) {
            return;
        }
        if (untrack(() => preview && dashboardRawConfig['preview-expanded'] !== false)) {
            return;
        }
        const resultBoolean = Boolean(templateValues.expanded);
        if (resultBoolean !== untrack(() => open)) {
            // Use queueMicrotask to avoid effect loop as open needs to be updated after this effect completes.
            queueMicrotask(() => toggleOpen(resultBoolean));
        }
    });

    $effect(() => {
        // effect for preview changes. We untrack templateValues.expanded to avoid unnecessary effect triggering.
        if (preview === previewState || preview === undefined) {
            return;
        }
        previewState = preview;
        if (previewState && dashboardRawConfig['preview-expanded'] !== false) {
            setOpenState(true);
            showButtonUsers = true;
            return;
        }
        showButtonUsers = userInList(config['show-button-users']) ?? true;

        if (configTemplate('expanded')) {
            const templateExpanded = untrack(() => templateValues.expanded);
            if (templateExpanded !== undefined) {
                toggleOpen(Boolean(templateExpanded));
            }
            return;
        }
        setDefaultOpenState();
    });

    function configTemplate(templateKey: string): ExpanderCardTemplates | undefined {
        const template = config.templates && Array.isArray(config.templates) ?
            config.templates.find((t) => t.template === templateKey) : undefined;
        if (template && isJSTemplate(template.value_template)) {
            return template;
        }
        return undefined;
    }

    function userInList(userList: string[] | undefined): boolean | undefined {
        if (userList === undefined) {
            return undefined;
        }
        return hass?.user?.name !== undefined && userList.includes(hass?.user?.name);
    }

    function setDefaultOpenState() {
        // Do not run setDefaultOpenState if config.expanded is a JS template
        if (configTemplate('expanded')) {
            return;
        }
        if (userInList(config['start-expanded-users'])) {
            setOpenState(true);
            return;
        }
        if (configId === undefined) {
            seOpenStateFromConfig();
            return;
        }
        try {
            const storageValue = localStorage.getItem(lastStorageOpenStateId);
            if(storageValue === null){
                seOpenStateFromConfig();
                return;
            }
            // last state is stored in local storage
            const openStateByStorage = storageValue ? storageValue === 'true' : open;
            setOpenState(openStateByStorage);
        } catch (e) {
            console.error(e);
            setOpenState(false);
        }

    }

    function seOpenStateFromConfig() {
        // first time, set the state from config
        if (config.expanded !== undefined) {
            setOpenState(config.expanded);
            return;
        }
        setOpenState(false);
    }

    function toggleOpen(openState?: boolean) {
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout  = null;
        }
        const newOpenState = openState !== undefined ? openState : !open;
        if (!config.animation) {
            setOpenState(newOpenState);
            return;
        }

        animationState = newOpenState ? 'opening' : 'closing';
        if (newOpenState) {
            setOpenState(true);
            animationTimeout = setTimeout(() => {
                animationState = 'idle';
                animationTimeout = null;
            }, 350);
            return;
        }
        animationTimeout = setTimeout(() => {
            setOpenState(false);
            animationState = 'idle';
            animationTimeout = null;
        }, 350);

    }

    function setOpenState(openState: boolean) {
        open = openState;
        if (!preview && configId !== undefined) {
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

    function handleRawConfigUpdate(event: Event) {
        const rawConfig: ExpanderCardRawConfig = (event as CustomEvent).detail?.rawConfig;
        if (rawConfig) {
            if (JSON.stringify(rawConfig) !== JSON.stringify(dashboardRawConfig)) {
                dashboardRawConfig = rawConfig;
            }
        }
    };

    function handleDomEvent(event: Event) {
        const data: ExpanderCardDomEventDetail = (event as CustomEvent).detail?.['expander-card']?.data;
        if (data?.['expander-card-id'] && data['expander-card-id'] === config['expander-card-id']) {
            if (data.action === 'open' && !open) {
                toggleOpen(true);
                return;
            }

            if (data.action === 'close' && open) {
                toggleOpen(false);
                return;
            }

            if (data.action === 'toggle') {
                toggleOpen();
            }
        }
    };

    function cleanup() {
        document.body.removeEventListener('ll-custom', handleDomEvent);
        document.body.removeEventListener('expander-card-raw-config-updated', handleRawConfigUpdate);
        Object.entries(templateRenderers).forEach(([key, renderer]) => {
            renderer.then((untrackFunc) => {
                untrackFunc();
                delete templateRenderers[key];
            }).catch(() => {});
        });
        Object.entries(variableRenders).forEach(([key, renderer]) => {
            renderer.then((untrackFunc) => {
                untrackFunc();
                delete variableRenders[key];
            }).catch(() => {});
        });
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
        isScrolling = Math.abs(currentX - startX) > 10 || Math.abs(currentY - startY) > 10;
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

    const bindTemplateVariables = (haJS: Promise<HomeAssistantJavaScriptTemplatesRenderer>) => {
        for (const v of Object.values(config.variables ?? {})) {
            if (isJSTemplate(v.value_template)) {
                variableRenders[v.variable] = trackJSTemplate(
                    haJS,
                    (res) => {
                        setJSTemplateRef(haJS, v.variable, res);
                    },
                    v.value_template as string,
                    { config: config }
                );
            } else {
                setJSTemplateRef(haJS, v.variable, v.value_template);
            }
        }
    };

    const bindTemplates = () => {
        if (!config.templates) return;
        const refs = Object.values(config.variables || {}).reduce(
            (obj, value) => {
                obj[value.variable] = undefined;
                return obj;
            },
            {} as Record<string, unknown>
        );
        const haJS: Promise<HomeAssistantJavaScriptTemplatesRenderer> = getJSTemplateRenderer( { config: config }, refs );
        bindTemplateVariables(haJS);
        Object.values(config.templates || {}).forEach((t) => {
            if (isJSTemplate(t.value_template)) {
                templateRenderers[t.template] = trackJSTemplate(
                    haJS,
                    (res) => {
                        templateValues[t.template] = res;
                    },
                    t.value_template as string,
                    { config: config }
                );
            } else {
                templateValues[t.template] = t.value_template;
            }
        });
    };

    function setExpandedFromConfig(){
        if (configTemplate('expanded')) {
            return;
        }

        const minWidthExpanded = config['min-width-expanded'];
        const maxWidthExpanded = config['max-width-expanded'];
        const offsetWidth = document.body.offsetWidth;

        if (minWidthExpanded && maxWidthExpanded) {
            config.expanded = offsetWidth >= minWidthExpanded && offsetWidth <= maxWidthExpanded;
            return;
        }
        if (minWidthExpanded) {
            config.expanded = offsetWidth >= minWidthExpanded;
            return;
        }

        if (maxWidthExpanded) {
            config.expanded = offsetWidth <= maxWidthExpanded;
        }
    }

    function setStateByPreview() {
        if (!preview) {
            return;
        }
        if (dashboardRawConfig['preview-expanded'] !== false) {
            setOpenState(true);
            return;
        }

        if (configTemplate('expanded')) {
            const templateExpanded = untrack(() => templateValues.expanded);
            if (templateExpanded !== undefined) {
                setOpenState(Boolean(templateExpanded));
            } else {
                setOpenState(false);
            }
        } else{
            setDefaultOpenState();
        }
    }

    function getTouchEventElement(): HTMLElement | undefined {
        if (config['title-card-clickable'] && !config['title-card-button-overlay'] && titleCardDiv) {
            return titleCardDiv;
        }
        if (buttonElement) {
            return buttonElement;
        }
        return undefined;
    }

    onMount(() => {
        bindTemplates();
        setExpandedFromConfig();
        setStateByPreview();

        document.body.addEventListener('ll-custom', handleDomEvent);
        document.body.addEventListener('expander-card-raw-config-updated', handleRawConfigUpdate);

        const touchEventElement = getTouchEventElement();

        if (touchEventElement) {
            touchEventElement.addEventListener('touchstart', touchStart, { passive: true, capture: true });
            touchEventElement.addEventListener('touchmove', touchMove, { passive: true,capture: true });
            touchEventElement.addEventListener('touchcancel', touchCancel, { passive: true, capture: true });
            touchEventElement.addEventListener('touchend', touchEnd, { passive: true, capture: true });
            touchEventElement.addEventListener('touchend', touchEndAction, { passive: false, capture: false });
        }

        if (config['title-card-clickable'] && config['title-card-button-overlay'] && titleCardDiv) {
            const resizeObserver = new ResizeObserver(() => {
                if (buttonElement && titleCardDiv && expanderCard) {
                    const titleRect = titleCardDiv.getBoundingClientRect();
                    // While margin/padding set by expander-card is equal, users may have styled different margin/padding
                    overlayHeight = titleRect.height -
                        parseFloat(getComputedStyle(buttonElement).marginTop) -
                        parseFloat(getComputedStyle(buttonElement).marginBottom) +
                        parseFloat(getComputedStyle(expanderCard).paddingTop) +
                        parseFloat(getComputedStyle(expanderCard).paddingBottom);
                }
            });
            resizeObserver.observe(titleCardDiv);
        }

        return cleanup;
    });

    const buttonClick = (event: MouseEvent) => {
        if (!touchPreventClick) {
            forwardHaptic(event.currentTarget as HTMLElement, 'light');
            toggleOpen();
            return undefined;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        touchPreventClick = false;
        if (touchPreventClickTimeout) {
            clearTimeout(touchPreventClickTimeout);
            touchPreventClickTimeout = null;
        }
        return false;
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
     --expander-card-overlay-height:{overlayHeight ? `${overlayHeight}px` : 'auto'};
    "
    bind:this={expanderCard}>
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
                    <ha-icon style="--arrow-color:{arrowColorConfigOrTemplate}"
                      icon={iconConfigOrTemplate}
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
                <div class={`primary title${open ? ' open' : ' close'}`}>{titleConfigOrTemplate}</div>
                <ha-icon style="--arrow-color:{arrowColorConfigOrTemplate}"
                  icon={iconConfigOrTemplate}
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
    {#if userStyleTemplateOrConfig}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html userStyleTemplateOrConfig}
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
        height: var(--expander-card-overlay-height, auto);
        z-index: 1;
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
