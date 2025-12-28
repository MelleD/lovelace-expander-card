import { HAQuerySelector } from 'home-assistant-query-selector';
import { ExpanderCardRawConfig } from '../configtype';

const instance = new HAQuerySelector();
let rawConfig: ExpanderCardRawConfig = {};

instance.addEventListener('onLovelacePanelLoad', ({ detail }) => {
    detail.HUI_ROOT.element.then((root) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lovelaceConfig = (root as any).lovelace;
        if (lovelaceConfig?.config) {
            rawConfig = lovelaceConfig.config['expander-card'] || {};
        }
    }).catch(() => {
        rawConfig = {};
    }).finally(() => {
        document.body.dispatchEvent(new CustomEvent('expander-card-raw-config-updated', {
            detail: { rawConfig }, bubbles: true, composed: true
        }));
    });
});
instance.listen();

export const getDashboardRawConfig = (): ExpanderCardRawConfig => rawConfig;
