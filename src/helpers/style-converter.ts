/**
 * Converts a style value (string or object) to a CSS string.
 * @param style - The style value to convert, can be a string or an object with CSS selectors as keys
 *                and CSS property objects as values
 * @returns A CSS string suitable for injection into a <style> tag
 */
export const styleToString = (style: string | Record<string, Record<string, string>> | undefined): string | null => {
    if (!style) {
        return null;
    }

    if (typeof style === 'string') {
        return style;
    }

    // Convert nested object to CSS string
    // Object format: { ".selector": { "property": "value", ... }, ... }
    return Object.entries(style)
        .map(([selector, properties]) => {
            const rules = Object.entries(properties)
                .map(([property, value]) => `  ${property}: ${value};`)
                .join('\n');
            return `${selector} {\n${rules}\n}`;
        })
        .join('\n');
};
