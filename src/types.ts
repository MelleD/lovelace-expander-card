export type AnimationState = 'opening' | 'closing' | 'idle';

export interface HomeAssistantUser {
    id: string;
    name: string;
    is_admin: boolean;
    is_owner: boolean;
    system_generated: boolean;
}
export interface HomeAssistant {
    user?: HomeAssistantUser;
    [key: string]: unknown;
    localize(key: string, ...args: unknown[]): string;
}

export interface LovelaceCardConfig {
    index?: number;
    view_index?: number;
    type: string;
    disabled?: boolean;
    [key: string]: unknown;
}

export interface LovelaceCard extends HTMLElement {
    hass?: HomeAssistant;
    isPanel?: boolean;
    preview?: boolean;
    getCardSize(): number | Promise<number>;
    config?: LovelaceCardConfig;
}

export interface HuiCard extends LovelaceCard {
    load(): void;
    _element?: LovelaceCard;
}

export interface HaRipple extends HTMLElement {
    disabled?: boolean;
    // ha-ripple pre HA 2026.11.0
    startPressAnimation?(event?: Event): void;
    endPressAnimation?(): void;
    // ha-ripple post HA 2026.11.0
    _startPress?(event?: Event): void;
    _endPress?(): void;
}

export interface HuiRoot extends HTMLElement {
    lovelace?: {
        config: {
            [key: string]: unknown;
        };
    };
}

export interface ExpanderCardLlCustomEventDetail {
    'expander-card-id'?: string;
    action?: 'open' | 'close' | 'toggle';
}

export interface ExpanderCardEventDetail {
    [key: string]: {
        'property': string;
        'value': unknown;
    };
}

export interface HuiElementEditor extends HTMLElement {
    lovelace?: unknown;
    hasError?: boolean;
    toggleMode(): void;
}
