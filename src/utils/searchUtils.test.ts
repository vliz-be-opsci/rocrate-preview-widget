import { searchRoCrate } from './searchUtils';

describe('searchRoCrate recursive search', () => {
    const mockCrate = {
        "@graph": [
            {
                "@id": "http://example.com/crate415/",
                "@type": "Dataset",
                "name": "Example RO-Crate",
                "creator": {
                    "@type": "Person",
                    "name": "John Doe",
                    "email": "john.doe@example.com"
                }
            },
            {
                "@id": "http://example.com/crate415/data1.txt",
                "@type": "File",
                "name": "data1.txt",
                "description": "A text file containing example data."
            }
        ]
    };

    test('finds top-level matches and injects match metadata', () => {
        const results = searchRoCrate(mockCrate, "Dataset");
        expect(results.length).toBe(1);
        expect(results[0]["@id"]).toBe("http://example.com/crate415/");
        expect(results[0]._matchedPath).toBe("@type");
        expect(results[0]._matchedValue).toBe("Dataset");
        expect(results[0]._matchedQuery).toBe("dataset");
    });

    test('finds nested matches up to depth 3 and injects metadata', () => {
        const results = searchRoCrate(mockCrate, "john.doe@example.com");
        expect(results.length).toBe(1);
        expect(results[0]["@id"]).toBe("http://example.com/crate415/");
        expect(results[0]._matchedPath).toBe("creator ➔ email");
        expect(results[0]._matchedValue).toBe("john.doe@example.com");
    });

    test('finds property key name matches and injects metadata', () => {
        const results = searchRoCrate(mockCrate, "creator");
        expect(results.length).toBe(1);
        expect(results[0]["@id"]).toBe("http://example.com/crate415/");
        expect(results[0]._matchedPath).toBe("creator");
        expect(results[0]._matchedValue).toContain("John Doe");
    });
});
