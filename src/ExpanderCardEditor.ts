/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExpanderCardEditorNulls, ExpanderCardEditorSchema, expanderCardEditorTemplates, styleSchemaCSS, styleSchemaObject, StyleSchemaTypes } from './editortype';
import { showTitleCardEditFormDialog, TitleCardEditFormParams } from './title-card/showTitleCardEditForm';
import { HomeAssistantUser } from './types';

const wdw = window; // NOSONAR es2019

let helpers = (wdw as any).cardHelpers;
const helperPromise = new Promise<void>((resolve) => {
    if (helpers) resolve();
    if ((wdw as any).loadCardHelpers) {
        (wdw as any).loadCardHelpers().then((loadedHelpers: any) => {
            helpers = loadedHelpers;
            (wdw as any).cardHelpers = helpers;
            resolve();
        });
    }
});

async function fetchUsers(): Promise<void> {
    const el = document.querySelector('home-assistant');
    const hass = (el as any)?.hass;
    if (!hass) return;
    const users = await hass.callWS({ type: 'config/auth/list' });
    return users
        .filter((user: HomeAssistantUser) => !user.system_generated)
        .map((user: HomeAssistantUser) => user.name);
}

const loader = async (): Promise<any> => {
    // create a temporary vertical-stack card to inherit from
    const verticalStackCard = await helperPromise.then(() =>
        helpers.createCardElement({ type: 'vertical-stack', cards: [] }));
    // get its editor class once hui-vertical-stack-card is defined
    // we need check hui-vertical-stack-card is defined as it is lazily loaded
    const verticalStackEditor = await customElements.whenDefined('hui-vertical-stack-card')
        .then(() => verticalStackCard.constructor.getConfigElement());
    // fetch users
    const users = await fetchUsers();
    // return a new class that extends the vertical-stack editor
    return class ExpanderCardEditor extends verticalStackEditor.constructor {
        public constructor() {
            super();
            this._users = users;
        }

        // override setConfig to store config only and not assert stack editor config
        // we also upgrade any old config here if needed
        public setConfig(config: any): void {
            this._config = config;
        }

        // define _schema getter to return our own schema
        public get _schema(): any {
            const schema = ExpanderCardEditorSchema;
            const schemaJSON = JSON.stringify(schema);
            const usersEscaped = this._users
                .map((u: string) => u.replace(/\\/g, '\\\\').replace(/"/g, '\\"')) // NOSONAR es2019
                .join('","');
            let populatedSchemaJSON = schemaJSON.replace(/\[\[users\]\]/g, usersEscaped); // NOSONAR es2019
            // populate templates options, but only those not already in config
            populatedSchemaJSON = populatedSchemaJSON.replace(/\[\[templates\]\]/g, // NOSONAR es2019
                expanderCardEditorTemplates
                    .filter((t: any) => !this._config.templates?.some((ct: any) => ct.template === t))
                    .join('","'));
            // populate advanced styling schema
            const styleSchemaType: StyleSchemaTypes = this._config.style && typeof this._config.style === 'object' ? StyleSchemaTypes.Object : StyleSchemaTypes.CSS;
            const styleSchema = styleSchemaType === StyleSchemaTypes.CSS ? JSON.stringify(styleSchemaCSS) : JSON.stringify(styleSchemaObject);
            populatedSchemaJSON = populatedSchemaJSON.replace(/"\[\[style\]\]"/g, styleSchema); // NOSONAR es2019
            const populatedSchema = JSON.parse(populatedSchemaJSON);
            return populatedSchema;
        }

        // _schema setter does nothing as we want to use our own schema
        public set _schema(_) {
            // do nothing
        }

        public connectedCallback(): void {
            super.connectedCallback();

            this.addEventListener('show-dialog', this.showDialogCallback.bind(this), true);
        }

        public disconnectedCallback(): void {
            super.disconnectedCallback();
            this.removeEventListener('show-dialog', this.showDialogCallback.bind(this), true);
        }

        private readonly showDialogCallback = (ev: CustomEvent): void => {
            const isExpanderCardTitleCardSchema =
                ev.detail?.dialogParams?.schema?.find((s: any) => s.name === 'expander_card_title_card_marker');
            if (isExpanderCardTitleCardSchema) {
                ev.stopPropagation();
                // load the form-dialog element to make sure ha-dialog is defined
                // then show the title card edit form dialog
                if (ev.detail?.dialogImport) {
                    ev.detail.dialogImport().then(async () => {
                        const params: TitleCardEditFormParams = {
                            title: 'Title card',
                            config: this._config['title-card'] || {},
                            submit: ev.detail?.dialogParams?.submit,
                            cancel: ev.detail?.dialogParams?.cancel,
                            submitText: ev.detail?.dialogParams?.submitText,
                            cancelText: ev.detail?.dialogParams?.cancelText,
                            lovelace: this.lovelace
                        };
                        await showTitleCardEditFormDialog(
                            this as unknown as HTMLElement,
                            params
                        );
                    });
                }
            }
        };

        // override _computeLabelCallback to show label or name
        public _computeLabelCallback = (item: any): string => item.label ?? item.name ?? '';

        // override _valueChanged to remove null values from config before storing and firing event
        public _valueChanged = (ev: CustomEvent): void => {
            const config = ev.detail.value;
            const entries = Object.entries(ExpanderCardEditorNulls);
            for (const [key, value] of entries) {
                if (typeof value === 'object' && Array.isArray(value) && Array.isArray(config[key])) {
                    if (JSON.stringify(config[key]) === JSON.stringify(value)) {
                        delete config[key];
                    }
                    continue;
                }
                if (config[key] === value) {
                    delete config[key];
                }
            }
            this._config = config;
            this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
        };
    };
};

export const loadExpanderCardEditor = (async () => {
    // Wait for scoped customElements registry to be set up
    while (customElements.get('home-assistant') === undefined)
        await new Promise((resolve) => wdw.setTimeout(resolve, 100));

    if (!customElements.get('expander-card-editor')) {
        const expanderCardEditor = await loader();
        customElements.define('expander-card-editor', expanderCardEditor);
    }
});
