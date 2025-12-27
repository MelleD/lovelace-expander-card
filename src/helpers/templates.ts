import HomeAssistantJavaScriptTemplates, { HomeAssistant, HomeAssistantJavaScriptTemplatesRenderer } from 'home-assistant-javascript-templates';
import { ExpanderCardEventDetail } from '../types';

export function getJSTemplateRenderer(variables: Record<string, unknown> = {}, refs: Record<string, unknown> = {}): Promise<HomeAssistantJavaScriptTemplatesRenderer> {
    return new HomeAssistantJavaScriptTemplates(
        document.querySelector('home-assistant') as HomeAssistant,
        {
            autoReturn: false,
            variables,
            refs,
            refsVariableName: 'variables'
        }
    ).getRenderer();
}

export function isJSTemplate(template: unknown): boolean {
    if (!template || typeof template !== 'string') return false;
    return String(template).trim().startsWith('[[[') && String(template).trim().endsWith(']]]');
}

export function renderJSTemplate(
    templatesRenderer: Promise<HomeAssistantJavaScriptTemplatesRenderer>,
    template: string,
    variables: Record<string, unknown> = {}) {
    if (!isJSTemplate(template)) {
        throw new Error('Not a valid JS template');
    }
    template = String(template).trim().slice(3, -3);
    void templatesRenderer.then((renderer) => renderer.renderTemplate(template, { variables } ));
}

export function trackJSTemplate(
    templatesRenderer: Promise<HomeAssistantJavaScriptTemplatesRenderer>,
    callback: (result: unknown) => void,
    template: string,
    variables: Record<string, unknown> = {}): Promise<(() => void)> {
    if (!isJSTemplate(template)) {
        throw new Error('Not a valid JS template');
    }
    template = String(template).trim().slice(3, -3);
    return templatesRenderer.then((renderer) => renderer.trackTemplate(template, callback, { variables }));
}

export function setJSTemplateRef(
    templatesRenderer: Promise<HomeAssistantJavaScriptTemplatesRenderer>,
    refName: string,
    refValue: unknown) {
    void templatesRenderer.then((renderer) => {
        renderer.refs[refName] = refValue;
    });
}

function eventHandler(templatesRenderer: Promise<HomeAssistantJavaScriptTemplatesRenderer>, event: Event) {
    void templatesRenderer.then((renderer) => {
        const detail = (event as CustomEvent).detail as ExpanderCardEventDetail;
        Object.keys(detail).forEach((key) => {
            const property = detail[key].property;
            const value = detail[key].value;
            const variableName = `${key}_${property}`;
            renderer.refs[variableName] = value;
        });
    });
}

export function trackJSTemplateEvent(
    templatesRenderer: Promise<HomeAssistantJavaScriptTemplatesRenderer>,
    eventName: string): () => void {
    const boundEventHandler = eventHandler.bind(null, templatesRenderer);
    document.addEventListener(eventName, boundEventHandler as EventListener);
    return () => {
        document.removeEventListener(eventName, boundEventHandler as EventListener);
    };
}
