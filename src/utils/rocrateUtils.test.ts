import { getContextLink } from './rocrateUtils';

describe('getContextLink', () => {
    test('resolves prefix from object context', () => {
        const rocrate = {
            "@context": {
                "dct": "http://purl.org/dc/terms/"
            }
        };
        const result = getContextLink(rocrate, "dct:format");
        expect(result).toBe("http://purl.org/dc/terms/format");
    });

    test('resolves prefix from array context with objects', () => {
        const rocrate = {
            "@context": [
                "https://w3id.org/ro/crate/1.1/context",
                {
                    "dct": "http://purl.org/dc/terms/",
                    "edam": "http://edamontology.org/"
                }
            ]
        };
        const result = getContextLink(rocrate, "dct:format");
        expect(result).toBe("http://purl.org/dc/terms/format");
    });

    test('resolves edam prefix from array context', () => {
        const rocrate = {
            "@context": [
                "https://w3id.org/ro/crate/1.1/context",
                {
                    "dct": "http://purl.org/dc/terms/",
                    "edam": "http://edamontology.org/"
                }
            ]
        };
        const result = getContextLink(rocrate, "edam:format_1929");
        expect(result).toBe("http://edamontology.org/format_1929");
    });

    test('falls back to schema.org for unknown prefix', () => {
        const rocrate = {
            "@context": {
                "dct": "http://purl.org/dc/terms/"
            }
        };
        const result = getContextLink(rocrate, "unknown:property");
        expect(result).toBe("http://schema.org/unknown:property");
    });

    test('falls back to schema.org when no context is provided', () => {
        const rocrate = {};
        const result = getContextLink(rocrate, "dct:format");
        expect(result).toBe("http://schema.org/dct:format");
    });

    test('handles properties without prefix', () => {
        const rocrate = {
            "@context": "https://w3id.org/ro/crate/1.1/context"
        };
        const result = getContextLink(rocrate, "name");
        expect(result).toBe("http://schema.org/name");
    });

    test('handles array context with only strings', () => {
        const rocrate = {
            "@context": [
                "https://w3id.org/ro/crate/1.1/context",
                "https://schema.org"
            ]
        };
        const result = getContextLink(rocrate, "dct:format");
        expect(result).toBe("http://schema.org/dct:format");
    });

    test('handles null context gracefully', () => {
        const rocrate = {
            "@context": null
        };
        const result = getContextLink(rocrate, "dct:format");
        expect(result).toBe("http://schema.org/dct:format");
    });

    test('handles array context with null items', () => {
        const rocrate = {
            "@context": [
                "https://w3id.org/ro/crate/1.1/context",
                null,
                {
                    "dct": "http://purl.org/dc/terms/"
                }
            ]
        };
        const result = getContextLink(rocrate, "dct:format");
        expect(result).toBe("http://purl.org/dc/terms/format");
    });

    test('handles array context with nested arrays gracefully', () => {
        const rocrate = {
            "@context": [
                "https://w3id.org/ro/crate/1.1/context",
                [{"nested": "array"}],
                {
                    "dct": "http://purl.org/dc/terms/"
                }
            ]
        };
        const result = getContextLink(rocrate, "dct:format");
        expect(result).toBe("http://purl.org/dc/terms/format");
    });
});
