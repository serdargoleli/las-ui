
/**
 * Arbitrary değerler için property mapping
 * Örnek: bg-[#123] -> background-color: #123
 */
const ARBITRARY_PROPERTY_MAP: Record<string, string> = {
    // Colors
    "bg": "background-color",
    "text": "color",
    "border": "border-color",
    "outline": "outline-color",

    // Spacing
    "p": "padding",
    "px": "padding-inline",
    "py": "padding-block",
    "pt": "padding-top",
    "pr": "padding-right",
    "pb": "padding-bottom",
    "pl": "padding-left",

    "m": "margin",
    "mx": "margin-inline",
    "my": "margin-block",
    "mt": "margin-top",
    "mr": "margin-right",
    "mb": "margin-bottom",
    "ml": "margin-left",

    "gap": "gap",
    "gap-x": "column-gap",
    "gap-y": "row-gap",

    // Sizing
    "w": "width",
    "h": "height",
    "min-w": "min-width",
    "min-h": "min-height",
    "max-w": "max-width",
    "max-h": "max-height",


};

export function generateArbitrary(className: string): string | null {
    const parsed = parseArbitraryValue(className);
    if (!parsed) return null;
    let { prefix, value } = parsed;
    if (prefix.endsWith('-')) {
        prefix = prefix.slice(0, -1);
    }
    const cssProperty = ARBITRARY_PROPERTY_MAP[prefix];
    if (!cssProperty) return null;

    const sanitizedValue = sanitizeArbitraryValue(value);
    if (!sanitizedValue) return null;

    return `${cssProperty}: ${sanitizedValue}`;
}

export function parseArbitraryValue(className: string): { prefix: string; value: string } | null {
    const match = className.match(/^([a-z-]+)\[(.+)\]$/);
    if (!match) return null;

    return {
        prefix: match[1],
        value: match[2]
    };
}

function sanitizeArbitraryValue(value: string): string | null {
    // İzin verilen karakterler: a-z, A-Z, 0-9, #, %, px, rem, em, vw, vh, (, ), ,, ., -, +, space
    const allowedPattern = /^[a-zA-Z0-9#%(),.+\-\s]+$/;

    if (!allowedPattern.test(value)) {
        return null;
    }

    return value;
}
