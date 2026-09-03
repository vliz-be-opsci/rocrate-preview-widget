import {
    getContextLink,
    hasType,
    getRoCrateSpecVersion,
    detectRoCrateVersion,
    extractRootData,
    getPartId,
    getFileDownloadUrl,
    getLabelForItem,
    getIDforItem
} from './rocrateUtils';

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

describe('hasType', () => {
    test('returns true when @type is a string matching the type', () => {
        const item = {
            "@id": "test.txt",
            "@type": "File"
        };
        expect(hasType(item, "File")).toBe(true);
    });

    test('returns false when @type is a string not matching the type', () => {
        const item = {
            "@id": "test",
            "@type": "Dataset"
        };
        expect(hasType(item, "File")).toBe(false);
    });

    test('returns true when @type is an array containing the type', () => {
        const item = {
            "@id": "test.txt",
            "@type": ["File", "SomeOtherType"]
        };
        expect(hasType(item, "File")).toBe(true);
    });

    test('returns true when @type is an array with File as second element', () => {
        const item = {
            "@id": "test.txt",
            "@type": ["SomeOtherType", "File"]
        };
        expect(hasType(item, "File")).toBe(true);
    });

    test('returns false when @type is an array not containing the type', () => {
        const item = {
            "@id": "test",
            "@type": ["Dataset", "SomeOtherType"]
        };
        expect(hasType(item, "File")).toBe(false);
    });

    test('returns false when item has no @type', () => {
        const item = {
            "@id": "test"
        };
        expect(hasType(item, "File")).toBe(false);
    });

    test('returns false when item is null', () => {
        expect(hasType(null, "File")).toBe(false);
    });

    test('returns false when item is undefined', () => {
        expect(hasType(undefined, "File")).toBe(false);
    });

    test('handles multiple types correctly', () => {
        const item = {
            "@id": "person",
            "@type": ["Person", "Agent"]
        };
        expect(hasType(item, "Person")).toBe(true);
        expect(hasType(item, "Agent")).toBe(true);
        expect(hasType(item, "Organization")).toBe(false);
    });
});

describe('getRoCrateSpecVersion', () => {
    test('returns @id when conformsTo is a simple object', () => {
        const conformsTo = {
            "@id": "https://w3id.org/ro/crate/1.1"
        };
        expect(getRoCrateSpecVersion(conformsTo)).toBe("https://w3id.org/ro/crate/1.1");
    });

    test('returns RO-Crate spec URL when conformsTo is an array with multiple items', () => {
        const conformsTo = [
            {
                "@id": "https://w3id.org/ro/crate/1.2"
            },
            {
                "@id": "https://data.emobon.embrc.eu/analysis-results-profile/latest/"
            }
        ];
        expect(getRoCrateSpecVersion(conformsTo)).toBe("https://w3id.org/ro/crate/1.2");
    });

    test('returns RO-Crate spec URL even when it is not the first item', () => {
        const conformsTo = [
            {
                "@id": "https://data.emobon.embrc.eu/analysis-results-profile/latest/"
            },
            {
                "@id": "https://w3id.org/ro/crate/1.2"
            }
        ];
        expect(getRoCrateSpecVersion(conformsTo)).toBe("https://w3id.org/ro/crate/1.2");
    });

    test('returns first @id when array has no RO-Crate spec URL', () => {
        const conformsTo = [
            {
                "@id": "https://example.com/profile/1"
            },
            {
                "@id": "https://example.com/profile/2"
            }
        ];
        expect(getRoCrateSpecVersion(conformsTo)).toBe("https://example.com/profile/1");
    });

    test('returns undefined when conformsTo is null', () => {
        expect(getRoCrateSpecVersion(null)).toBeUndefined();
    });

    test('returns undefined when conformsTo is undefined', () => {
        expect(getRoCrateSpecVersion(undefined)).toBeUndefined();
    });

    test('returns undefined when conformsTo is an empty array', () => {
        expect(getRoCrateSpecVersion([])).toBeUndefined();
    });

    test('returns undefined when conformsTo is an empty object', () => {
        expect(getRoCrateSpecVersion({})).toBeUndefined();
    });

    test('handles array with null items gracefully', () => {
        const conformsTo = [
            null,
            {
                "@id": "https://w3id.org/ro/crate/1.1"
            }
        ];
        expect(getRoCrateSpecVersion(conformsTo)).toBe("https://w3id.org/ro/crate/1.1");
    });

    test('handles array with items missing @id', () => {
        const conformsTo = [
            {
                "name": "some-profile"
            },
            {
                "@id": "https://w3id.org/ro/crate/1.2"
            }
        ];
        expect(getRoCrateSpecVersion(conformsTo)).toBe("https://w3id.org/ro/crate/1.2");
    });

    test('correctly distinguishes between array and object with @id property', () => {
        // This test ensures arrays aren't confused with objects
        const arrayWithCustomProp = [
            {
                "@id": "https://w3id.org/ro/crate/1.2"
            }
        ];
        // Add a custom @id property to the array (edge case)
        (arrayWithCustomProp as any)["@id"] = "https://should-not-use-this.com";
        
        // Should still treat it as an array and find the RO-Crate spec
        expect(getRoCrateSpecVersion(arrayWithCustomProp)).toBe("https://w3id.org/ro/crate/1.2");
    });

    test('handles string conformsTo URL directly', () => {
        expect(getRoCrateSpecVersion("https://w3id.org/ro/crate/1.2")).toBe("https://w3id.org/ro/crate/1.2");
    });
});

describe('detectRoCrateVersion', () => {
    test('detects RO-Crate 1.1 with descriptor conformsTo and context', () => {
        const crate = {
            "@context": "https://w3id.org/ro/crate/1.1/context",
            "@graph": [
                {
                    "@id": "ro-crate-metadata.json",
                    "@type": "CreativeWork",
                    "about": { "@id": "./" },
                    "conformsTo": { "@id": "https://w3id.org/ro/crate/1.1" }
                },
                {
                    "@id": "./",
                    "@type": "Dataset"
                }
            ]
        };
        const info = detectRoCrateVersion(crate);
        expect(info.specVersion).toBe("1.1");
        expect(info.specUri).toBe("https://w3id.org/ro/crate/1.1");
        expect(info.isProfileCrate).toBe(false);
    });

    test('detects RO-Crate 1.2 with string about and root conformsTo profiles', () => {
        const crate = {
            "@context": "https://w3id.org/ro/crate/1.2/context",
            "@graph": [
                {
                    "@id": "ro-crate-metadata.json",
                    "@type": ["https://schema.org/CreativeWork", "CreativeWork"],
                    "about": "./",
                    "conformsTo": { "@id": "https://w3id.org/ro/crate/1.2" }
                },
                {
                    "@id": "./",
                    "@type": ["https://schema.org/Dataset", "Dataset"],
                    "conformsTo": [
                        { "@id": "https://data.emobon.embrc.eu/observatory-profile/1.0" }
                    ]
                }
            ]
        };
        const info = detectRoCrateVersion(crate);
        expect(info.specVersion).toBe("1.2");
        expect(info.specUri).toBe("https://w3id.org/ro/crate/1.2");
        expect(info.profiles).toContain("https://data.emobon.embrc.eu/observatory-profile/1.0");
    });

    test('detects Profile Crate when CreativeWork has Profile type', () => {
        const crate = {
            "@context": "https://w3id.org/ro/crate/1.2/context",
            "@graph": [
                {
                    "@id": "ro-crate-metadata.json",
                    "@type": ["CreativeWork", "Profile"],
                    "about": "./",
                    "conformsTo": { "@id": "https://w3id.org/ro/crate/1.2" }
                },
                {
                    "@id": "./",
                    "@type": "Dataset"
                }
            ]
        };
        const info = detectRoCrateVersion(crate);
        expect(info.isProfileCrate).toBe(true);
    });

    test('detects detached crate when files have absolute URLs', () => {
        const crate = {
            "@context": "https://w3id.org/ro/crate/1.2/context",
            "@graph": [
                {
                    "@id": "ro-crate-metadata.json",
                    "@type": "CreativeWork",
                    "about": "./"
                },
                {
                    "@id": "./",
                    "@type": "Dataset",
                    "hasPart": ["https://example.org/data.csv"]
                },
                {
                    "@id": "https://example.org/data.csv",
                    "@type": "File"
                }
            ]
        };
        const info = detectRoCrateVersion(crate);
        expect(info.isDetached).toBe(true);
    });

    test('returns unknown for unversioned crate', () => {
        const crate = {
            "@context": "https://schema.org",
            "@graph": []
        };
        const info = detectRoCrateVersion(crate);
        expect(info.specVersion).toBe("unknown");
    });
});

describe('extractRootData', () => {
    test('extracts root data with 1.1 object about {"@id": "./"}', () => {
        const graph = [
            {
                "@id": "ro-crate-metadata.json",
                "@type": "CreativeWork",
                "about": { "@id": "./" }
            },
            {
                "@id": "./",
                "@type": "Dataset",
                "name": "Root Dataset"
            }
        ];
        const root = extractRootData(graph);
        expect(root).toBeDefined();
        expect(root["@id"]).toBe("./");
        expect(root["name"]).toBe("Root Dataset");
    });

    test('extracts root data with 1.2 string about "./"', () => {
        const graph = [
            {
                "@id": "ro-crate-metadata.json",
                "@type": "CreativeWork",
                "about": "./"
            },
            {
                "@id": "./",
                "@type": "Dataset",
                "name": "1.2 Dataset"
            }
        ];
        const root = extractRootData(graph);
        expect(root).toBeDefined();
        expect(root["@id"]).toBe("./");
        expect(root["name"]).toBe("1.2 Dataset");
    });

    test('extracts root data with array about', () => {
        const graph = [
            {
                "@id": "ro-crate-metadata.json",
                "@type": "CreativeWork",
                "about": ["./"]
            },
            {
                "@id": "./",
                "@type": "Dataset",
                "name": "Array Dataset"
            }
        ];
        const root = extractRootData(graph);
        expect(root).toBeDefined();
        expect(root["@id"]).toBe("./");
    });

    test('falls back to entity with @id "./" when about is missing', () => {
        const graph = [
            {
                "@id": "ro-crate-metadata.json",
                "@type": "CreativeWork"
            },
            {
                "@id": "./",
                "@type": "Dataset",
                "name": "Fallback Dataset"
            }
        ];
        const root = extractRootData(graph);
        expect(root).toBeDefined();
        expect(root["@id"]).toBe("./");
    });

    test('falls back to Dataset entity with hasPart', () => {
        const graph = [
            {
                "@id": "custom-id",
                "@type": "Dataset",
                "name": "Dataset with parts",
                "hasPart": ["file.txt"]
            }
        ];
        const root = extractRootData(graph);
        expect(root).toBeDefined();
        expect(root["@id"]).toBe("custom-id");
    });

    test('returns null for empty or null graph', () => {
        expect(extractRootData([])).toBeNull();
        expect(extractRootData(null as any)).toBeNull();
    });
});

describe('getPartId', () => {
    test('returns string directly when part is string', () => {
        expect(getPartId("all-triples.ttl")).toBe("all-triples.ttl");
    });

    test('returns @id when part is object with @id', () => {
        expect(getPartId({ "@id": "data.csv" })).toBe("data.csv");
    });

    test('returns empty string for null, undefined, or missing @id', () => {
        expect(getPartId(null)).toBe("");
        expect(getPartId(undefined)).toBe("");
        expect(getPartId({})).toBe("");
    });
});

describe('getFileDownloadUrl', () => {
    test('prefers 1.2 contentUrl when present', () => {
        const item = {
            contentUrl: "https://example.org/download/content",
            downloadUrl: "https://example.org/download/old"
        };
        expect(getFileDownloadUrl(item)).toBe("https://example.org/download/content");
    });

    test('falls back to downloadUrl or downloadURL', () => {
        expect(getFileDownloadUrl({ downloadUrl: "https://example.org/file.csv" })).toBe("https://example.org/file.csv");
        expect(getFileDownloadUrl({ downloadURL: "https://example.org/file2.csv" })).toBe("https://example.org/file2.csv");
    });

    test('returns undefined when no download URL is present', () => {
        expect(getFileDownloadUrl({})).toBeUndefined();
        expect(getFileDownloadUrl(null)).toBeUndefined();
    });
});

describe('getLabelForItem', () => {
    test('returns string directly when item is a string', () => {
        expect(getLabelForItem("some-id.csv")).toBe("some-id.csv");
    });

    test('handles https://schema.org/name', () => {
        const item = {
            "@id": "urn:spatial:BPNS",
            "https://schema.org/name": "BPNS Station"
        };
        expect(getLabelForItem(item)).toBe("BPNS Station");
    });

    test('handles dct:title and dcterms:title', () => {
        expect(getLabelForItem({ "@id": "x", "dct:title": "Marine Survey" })).toBe("Marine Survey");
        expect(getLabelForItem({ "@id": "y", "dcterms:title": "Ocean Survey" })).toBe("Ocean Survey");
    });

    test('falls back to @id when no label matches', () => {
        expect(getLabelForItem({ "@id": "entity-123" })).toBe("entity-123");
    });
});

describe('getIDforItem', () => {
    test('matches when item is string ID', () => {
        const graph = [{ "@id": "file.txt", "name": "File 1" }];
        expect(getIDforItem("file.txt", graph)).toEqual({ "@id": "file.txt", "name": "File 1" });
    });

    test('matches when item is object with @id', () => {
        const graph = [{ "@id": "file.txt", "name": "File 1" }];
        expect(getIDforItem({ "@id": "file.txt" }, graph)).toEqual({ "@id": "file.txt", "name": "File 1" });
    });

    test('returns item if not found in graph', () => {
        const graph = [{ "@id": "file.txt" }];
        expect(getIDforItem("unknown.txt", graph)).toBe("unknown.txt");
    });
});

describe('hasType with full schema.org URIs', () => {
    test('matches full https://schema.org/Dataset against Dataset', () => {
        expect(hasType({ "@type": "https://schema.org/Dataset" }, "Dataset")).toBe(true);
    });

    test('matches array with https://schema.org/Dataset and Dataset', () => {
        expect(hasType({ "@type": ["https://schema.org/Dataset", "Dataset"] }, "Dataset")).toBe(true);
    });

    test('matches schema:Dataset', () => {
        expect(hasType({ "@type": "schema:Dataset" }, "Dataset")).toBe(true);
    });
});

describe('getContextLink with full URIs', () => {
    test('returns full URL unchanged instead of prepending schema.org', () => {
        const rocrate = { "@context": "https://w3id.org/ro/crate/1.2/context" };
        expect(getContextLink(rocrate, "https://schema.org/Dataset")).toBe("https://schema.org/Dataset");
        expect(getContextLink(rocrate, "http://www.w3.org/ns/dcat#contactPoint")).toBe("http://www.w3.org/ns/dcat#contactPoint");
    });

    test('handles array of types by taking first type', () => {
        const rocrate = { "@context": "https://w3id.org/ro/crate/1.2/context" };
        expect(getContextLink(rocrate, ["https://schema.org/Dataset", "Dataset"])).toBe("https://schema.org/Dataset");
    });
});
