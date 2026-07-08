import { searchRoCrate } from './searchUtils';

describe('searchRoCrate', () => {
    const mockCrate = {
        "@graph": [
            {
                "@id": "http://example.com/crate415/",
                "@type": "Dataset",
                "name": "My RO-Crate Dataset"
            },
            {
                "@id": "http://example.com/crate415/data1.txt",
                "@type": "File",
                "description": "Simple text file"
            }
        ]
    };

    test('finds matches based on @id', () => {
        const results = searchRoCrate(mockCrate, "data1");
        expect(results.length).toBe(1);
        expect(results[0].item["@id"]).toBe("http://example.com/crate415/data1.txt");
        expect(results[0].matchedPath).toBe("@id");
        expect(results[0].matchedValue).toBe("http://example.com/crate415/data1.txt");
        expect(results[0].query).toBe("data1");
    });

    test('finds multiple matches when @id matches query', () => {
        const results = searchRoCrate(mockCrate, "crate415");
        expect(results.length).toBe(2);
        expect(results[0].item["@id"]).toBe("http://example.com/crate415/");
        expect(results[1].item["@id"]).toBe("http://example.com/crate415/data1.txt");
    });

    test('returns empty array when no matches found', () => {
        const results = searchRoCrate(mockCrate, "nonexistent");
        expect(results.length).toBe(0);
    });
});
