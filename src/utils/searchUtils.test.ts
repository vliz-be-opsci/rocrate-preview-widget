import { searchRoCrate } from './searchUtils';

describe('searchRoCrate', () => {
    const mockCrate = {
        "@graph": [
            {
                "@id": "./",
                "@type": "Dataset",
                "name": "My RO-Crate Dataset",
                "publisher": {
                    "@id": "https://example.com/publisher",
                    "name": "Data Publishing Org"
                }
            },
            {
                "@id": "file.txt",
                "@type": "File",
                "description": "Simple text file",
                "author": {
                    "contactPoint": {
                        "email": "author@example.com"
                    }
                }
            }
        ]
    };

    test('finds top-level matches', () => {
        const results = searchRoCrate(mockCrate, "Dataset");
        expect(results.length).toBe(1);
        expect(results[0].item["@id"]).toBe("./");
        expect(results[0].matchedPath).toBe("@type");
        expect(results[0].matchedValue).toBe("Dataset");
    });

    test('finds nested matches up to depth 3', () => {
        const results = searchRoCrate(mockCrate, "author@example.com");
        expect(results.length).toBe(1);
        expect(results[0].item["@id"]).toBe("file.txt");
        expect(results[0].matchedPath).toBe("author ➔ contactPoint ➔ email");
        expect(results[0].matchedValue).toBe("author@example.com");
    });

    test('ignores @context metadata key', () => {
        const crateWithContext = {
            "@context": "https://w3id.org/ro/crate/1.1/context",
            "@graph": [
                {
                    "@id": "file.txt",
                    "name": "Special file"
                }
            ]
        };
        const results = searchRoCrate(crateWithContext, "w3id.org");
        expect(results.length).toBe(0);
    });
});
