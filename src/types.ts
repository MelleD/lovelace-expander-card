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
    startPressAnimation(event?: Event): void;
    endPressAnimation(): void;
}

export interface ExpanderCardDomEventDetail {
    'expander-card-id'?: string;
    action?: 'open' | 'close' | 'toggle';
}
