/**
 * Converts a style value (string or object) to a CSS string.
 * @param style - The style value to convert, can be a string or an object with CSS selectors as keys
 *                and CSS property arrays as values (either strings or objects)
 * @returns A CSS string suitable for injection into a <style> tag
 */
export const styleToString = (style: string | Record<string, (string | Record<string, string>)[]> | undefined): string | null => {
    if (!style) {
        return null;
    }

    if (typeof style === 'string') {
        return style;
    }

    // Convert nested object to CSS string
    // Object format: { ".selector": ["property1: value", ...] } or { ".selector": [{"property1": "value"}, ...] }
    return Object.entries(style)
        .map(([selector, properties]) => {
            // Skip if properties is not an array
            if (!Array.isArray(properties)) {
                return null;
            }
            const rules = properties
                .map((property) => {
                    // Handle both string format and object format
                    if (typeof property === 'string') {
                        return `  ${property};`;
                    }
                    // For objects, get the first key-value pair
                    const [key, value] = Object.entries(property)[0];
                    return `  ${key}: ${value};`;
                })
                .join('\n');
            return `${selector} {\n${rules}\n}`;
        })
        .filter((rule) => rule !== null)
        .join('\n');
};
