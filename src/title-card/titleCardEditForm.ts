/* eslint-disable no-underscore-dangle */
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { HomeAssistant, HuiElementEditor } from '../types';
import { TitleCardConfig, TitleCardEditFormParams } from './showTitleCardEditForm';
import { ifDefined } from 'lit/directives/if-defined.js';
import { haStyleDialog, haStyleDialogFixedTop } from '../helpers/ha-dialog-styles';

export const CUSTOM_TYPE_PREFIX = 'custom:';

const isCustomType = (type: string) =>
    type.startsWith(CUSTOM_TYPE_PREFIX);

const getCustomCardEntry = (type: string) =>
    window.customCards?.find((card) => card.type === type); // NOSONAR es2019

const stripCustomPrefix = (type: string) =>
    type.replace(CUSTOM_TYPE_PREFIX, '');

@customElement('expander-card-title-card-edit-form')
export class TitleCardEditForm extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @property({ type: Boolean, reflect: true }) public large = false;
    @property({ attribute: false }) public lovelace?: unknown;

    @state() private _params?: TitleCardEditFormParams;
    @state() private _config: TitleCardConfig = {};
    @state() private _cardGUIMode = true;
    @state() private _cardGUIModeAvailable = true;
    @state() private _error = false;

    @query('hui-card-element-editor') private _cardEditorEl?: HuiElementEditor; // NOSONAR Lit @query decorator updates

    public async showDialog(params: TitleCardEditFormParams): Promise<void> {
        this._params = params;
        this._config = params.config ?? {};
        this.lovelace = params.lovelace;
        this.large = false;
    }

    public closeDialog() {
        this._params = undefined;
        this._config = {};
        this.dispatchEvent(new CustomEvent('dialog-closed', { detail: { dialog: this.localName } }));
        return true;
    }

    private _submit(): void {
        this._params?.submit?.(this._config);
        this.closeDialog();
    }

    private _cancel(): void {
        this._params?.cancel?.();
        this.closeDialog();
    }

    private _enlarge() {
        this.large = !this.large;
    }

    private _ignoreKeydown(ev: KeyboardEvent): void {
        ev.stopPropagation();
    }

    protected render() {
        if (!this._params || !this.hass) {
            return nothing;
        }

        const disableSave = (!this._config.type || this._error) || undefined;
        let heading: string = this._params.title ?? '';
        if (this._config.type) {
            let cardName: string | undefined;
            if (isCustomType(this._config.type)) {
            // prettier-ignore
                cardName = getCustomCardEntry(
                    stripCustomPrefix(this._config.type)
                )?.name;
                // Trim names that end in " Card" so as not to redundantly duplicate it
                if (cardName?.toLowerCase().endsWith(' card')) {
                    cardName = cardName.substring(0, cardName.length - 5);
                }
            } else {
                cardName = this.hass.localize(
                    `ui.panel.lovelace.editor.card.${this._config.type}.name`
                );
            }
            heading = `${heading} - ${this.hass.localize(
                'ui.panel.lovelace.editor.edit_card.typed_header',
                { type: cardName }
            )}`;
        }

        return html`
        <ha-dialog
            open
            scrimClickAction
            escapeKeyAction
            @keydown=${this._ignoreKeydown.bind(this)}
            @closed=${ this._cancel.bind(this) }
            .heading=${heading}
            .width=${this.large ? 'full' : 'large'}
        >
            <ha-dialog-header slot="header">
                <ha-icon-button
                    slot="navigationIcon"
                    dialogAction="cancel"
                    .label=${this.hass.localize('ui.common.close')}
                >
                    <ha-icon .icon=${'mdi:close'}></ha-icon>
                </ha-icon-button>
                <span slot="title" @click=${this._enlarge.bind(this)}>${heading}</span>
            </ha-dialog-header>
            ${this._renderCardEditor()}
            <ha-dialog-footer slot="footer">
                <div slot="primaryAction" @click=${this._submit.bind(this)}>
                    <ha-button
                        appearance="plain"
                        size="small"
                        @click=${this._cancel.bind(this)}
                        dialogInitialFocus
                    >
                        ${this._params.cancelText || this.hass.localize('ui.common.cancel')}
                    </ha-button>
                    <ha-button
                        size="small"
                        @click=${this._submit.bind(this)} 
                        disabled=${ifDefined(disableSave)}
                    >
                        ${this._params.submitText || this.hass.localize('ui.common.save')}
                    </ha-button>
                </div>
                ${this._renderCardEditorActions()}
            </ha-dialog-footer>
        </ha-dialog>
        `;
    }

    private _toggleCardMode() {
        this._cardEditorEl?.toggleMode();
    }

    private _deleteCard() {
        this._config = {};
    }

    private _cardConfigChanged(ev: CustomEvent) {
        ev.stopPropagation();
        this._config = { ...ev.detail.config };
        this._error = ev.detail.error;
        this._cardGUIModeAvailable = ev.detail.guiModeAvailable;
    }

    private _cardGUIModeChanged(ev: CustomEvent) {
        ev.stopPropagation();
        this._cardGUIMode = ev.detail.guiMode;
        this._cardGUIModeAvailable = ev.detail.guiModeAvailable;
    }

    private _renderCardEditorActions() {
        if (!this._config.type) {
            return nothing;
        }
        const cardMode: string = this.hass!.localize(
            (!this._cardEditorEl || this._cardGUIMode)
                ? 'ui.panel.lovelace.editor.edit_card.show_code_editor'
                : 'ui.panel.lovelace.editor.edit_card.show_visual_editor'
        );
        return html`
            <div slot="secondaryAction">
                <ha-button
                appearance="plain"
                size="small"
                @click=${this._toggleCardMode.bind(this)}
                .disabled=${!this._cardGUIModeAvailable}
                >
                    ${cardMode}
                </ha-button>
                <ha-button
                appearance="plain"
                size="small"
                @click=${this._deleteCard.bind(this)}
                >
                    Change card
                </ha-button>
            </div>
        `;
    }

    private _renderCardEditor() {
        const cardBlurClass = this._error ? 'blur' : '';
        const cardRenderBlurSpinner = this._error
            ? html` <ha-spinner aria-label="Can't update card"></ha-spinner> `
            : '';
        return html`
        ${this._config.type
            ? html`
            <div class="content">
                <div class="element-editor">
                    <hui-card-element-editor
                        .hass=${this.hass}
                        .lovelace=${this.lovelace}
                        .value=${this._config}
                        @config-changed=${this._cardConfigChanged.bind(this)}
                        @GUImode-changed=${this._cardGUIModeChanged.bind(this)}
                    ></hui-card-element-editor>
                </div>
                <div class="element-preview">
                    <hui-card
                        .hass=${this.hass}
                        .config=${this._config}
                        preview
                        class=${cardBlurClass}
                    ></hui-card>
                    ${cardRenderBlurSpinner}
                </div>
            </div>
            `
            : html`
            <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._cardConfigChanged.bind(this)}
            ></hui-card-picker>
            `}
        `;
    }

    public static readonly styles = [
        haStyleDialog,
        haStyleDialogFixedTop,
        css`
            :host {
                --code-mirror-max-height: calc(100vh - 176px);
            }

            ha-dialog {
                --dialog-z-index: 6;
                --dialog-content-padding: var(--ha-space-2);
            }

            .content {
                width: 100%;
                max-width: 100%;
            }

            @media all and (max-width: 450px), all and (max-height: 500px) {
            /* overrule the ha-style-dialog max-height on small screens */
                .content {
                    width: 100%;
                    max-width: 100%;
                }
            }

            @media all and (min-width: 451px) and (min-height: 501px) {
                :host([large]) .content {
                    max-width: none;
                }
            }

            .center {
                margin-left: auto;
                margin-right: auto;
            }

            .content {
                display: flex;
                flex-direction: column;
            }

            .content hui-card {
                display: block;
                padding: 4px;
                margin: 0 auto;
                max-width: 390px;
            }
            .content hui-section {
                display: block;
                padding: 4px;
                margin: 0 auto;
                max-width: var(--ha-view-sections-column-max-width, 500px);
            }
            .content .element-editor {
                margin: 0 10px;
            }

            @media (min-width: 1000px) {
                .content {
                    flex-direction: row;
                }
                .content > * {
                    flex-basis: 0;
                    flex-grow: 1;
                    flex-shrink: 1;
                    min-width: 0;
                }
                .content hui-card {
                    padding: 8px 10px;
                    margin: auto 0px;
                    max-width: 500px;
                }
                .content hui-section {
                    padding: 8px 10px;
                    margin: auto 0px;
                    max-width: var(--ha-view-sections-column-max-width, 500px);
                }
            }
            .hidden {
                display: none;
            }
            .element-editor {
                margin-bottom: 8px;
            }
            .blur {
                filter: blur(2px) grayscale(100%);
            }
            .element-preview {
                position: relative;
                height: max-content;
                background: var(--primary-background-color);
                padding: 4px;
                border-radius: var(--ha-border-radius-sm);
                position: sticky;
                top: 0;
            }
            .element-preview ha-spinner {
                top: calc(50% - 24px);
                left: calc(50% - 24px);
                position: absolute;
                z-index: 10;
            }
            hui-card {
                padding-top: 8px;
                margin-bottom: 4px;
                display: block;
                width: 100%;
                box-sizing: border-box;
            }

            [slot="primaryAction"] {
                gap: var(--ha-space-2);
                display: flex;
            }
            [slot="secondaryAction"] {
                gap: var(--ha-space-2);
                display: flex;
                margin-left: 0px;
                margin-right: auto;
                margin-inline-end: auto;
                margin-inline-start: initial;
            }
            [slot="navigationIcon"] {
                --ha-icon-display: block;
            }
        `];
}

declare global {
    interface HTMLElementTagNameMap {
        'expander-card-title-card-edit-form': TitleCardEditForm;
    }
}
