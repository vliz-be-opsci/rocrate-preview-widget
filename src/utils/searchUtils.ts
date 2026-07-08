export interface SearchMatch {
    item: any;
    matchedPath: string;
    matchedValue: string;
    query: string;
}

export function searchRoCrate(rocrate: any, query: string): SearchMatch[] {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery || !rocrate || !Array.isArray(rocrate["@graph"])) {
        return [];
    }

    // Reverted logic to match the original @id-based filter behavior
    const filtered = rocrate["@graph"].filter((item: any) =>
        item && item["@id"] && String(item["@id"]).toLowerCase().includes(cleanQuery)
    );

    return filtered.map((item: any) => ({
        item,
        matchedPath: "@id",
        matchedValue: item["@id"],
        query: cleanQuery
    }));
}
