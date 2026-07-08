export interface SearchMatch {
    item: any;
    matchedPath: string;
    matchedValue: string;
    query: string;
}

export function searchRoCrate(rocrate: any, query: string): SearchMatch[] {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery || !rocrate) {
        return [];
    }

    // Resolve the graph array dynamically to handle different wrapper structures
    let graph: any[] = [];
    if (Array.isArray(rocrate)) {
        graph = rocrate;
    } else if (Array.isArray(rocrate["@graph"])) {
        graph = rocrate["@graph"];
    } else if (rocrate && typeof rocrate === 'object') {
        if (Array.isArray(rocrate.graph)) {
            graph = rocrate.graph;
        } else {
            // Fallback: try to see if any property is an array of objects
            for (const key of Object.keys(rocrate)) {
                if (Array.isArray(rocrate[key]) && rocrate[key].length > 0 && typeof rocrate[key][0] === 'object') {
                    graph = rocrate[key];
                    break;
                }
            }
        }
    }

    if (!Array.isArray(graph) || graph.length === 0) {
        return [];
    }

    const results: SearchMatch[] = [];

    function traverse(val: any, currentPath: string[], depth: number): { path: string; value: string } | null {
        if (depth > 3) return null;
        if (val === null || val === undefined) return null;

        // 1. Primitive values (string, number, boolean)
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            const strVal = String(val);
            if (strVal.toLowerCase().includes(cleanQuery)) {
                return {
                    path: currentPath.join(" ➔ "),
                    value: strVal
                };
            }
            return null;
        }

        // 2. Arrays
        if (Array.isArray(val)) {
            for (let i = 0; i < val.length; i++) {
                const res = traverse(val[i], currentPath, depth + 1);
                if (res) return res;
            }
            return null;
        }

        // 3. Objects
        if (typeof val === 'object') {
            for (const key of Object.keys(val)) {
                if (key === '@context') continue;

                // Match by KEY name (e.g. if the user searches for "creator" or "author")
                if (key.toLowerCase().includes(cleanQuery)) {
                    const matchedVal = val[key];
                    let preview = "";
                    if (matchedVal && typeof matchedVal === 'object') {
                        preview = matchedVal["name"] || matchedVal["@id"] || JSON.stringify(matchedVal);
                    } else {
                        preview = String(matchedVal);
                    }
                    return {
                        path: [...currentPath, key].join(" ➔ "),
                        value: preview
                    };
                }

                // Match recursively by value
                const res = traverse(val[key], [...currentPath, key], depth + 1);
                if (res) return res;
            }
            return null;
        }

        return null;
    }

    for (const item of graph) {
        if (!item || typeof item !== 'object') continue;

        // Check if any property of the item matches
        for (const key of Object.keys(item)) {
            if (key === '@context') continue;

            // Match by top-level KEY name
            if (key.toLowerCase().includes(cleanQuery)) {
                const matchedVal = item[key];
                let preview = "";
                if (matchedVal && typeof matchedVal === 'object') {
                    preview = matchedVal["name"] || matchedVal["@id"] || JSON.stringify(matchedVal);
                } else {
                    preview = String(matchedVal);
                }
                results.push({
                    item,
                    matchedPath: key,
                    matchedValue: preview,
                    query: cleanQuery
                });
                break;
            }

            // Match recursively by value
            const res = traverse(item[key], [key], 1);
            if (res) {
                results.push({
                    item,
                    matchedPath: res.path,
                    matchedValue: res.value,
                    query: cleanQuery
                });
                break;
            }
        }
    }

    return results;
}
