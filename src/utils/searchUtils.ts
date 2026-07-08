export function searchRoCrate(rocrate: any, query: string): any[] {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery || !rocrate || !Array.isArray(rocrate["@graph"])) {
        return [];
    }

    const results: any[] = [];

    function traverse(val: any, currentPath: string[], depth: number): { path: string; value: string } | null {
        if (depth > 3) return null;
        if (val === null || val === undefined) return null;

        // 1. Primitives
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

                // Match by key name
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

    for (const item of rocrate["@graph"]) {
        if (!item || typeof item !== 'object') continue;

        let matched = false;
        let matchedPath = "";
        let matchedValue = "";

        for (const key of Object.keys(item)) {
            if (key === '@context') continue;

            // Match by top-level key name
            if (key.toLowerCase().includes(cleanQuery)) {
                const matchedVal = item[key];
                let preview = "";
                if (matchedVal && typeof matchedVal === 'object') {
                    preview = matchedVal["name"] || matchedVal["@id"] || JSON.stringify(matchedVal);
                } else {
                    preview = String(matchedVal);
                }
                matched = true;
                matchedPath = key;
                matchedValue = preview;
                break;
            }

            // Match recursively by value
            const res = traverse(item[key], [key], 1);
            if (res) {
                matched = true;
                matchedPath = res.path;
                matchedValue = res.value;
                break;
            }
        }

        if (matched) {
            // Clone the item to avoid modifying the original in-memory @graph reference
            const itemClone = { ...item };
            itemClone._matchedPath = matchedPath;
            itemClone._matchedValue = matchedValue;
            itemClone._matchedQuery = cleanQuery;
            results.push(itemClone);
        }
    }

    return results;
}
