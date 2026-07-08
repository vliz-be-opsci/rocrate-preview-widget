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

    const results: SearchMatch[] = [];

    function traverse(val: any, currentPath: string[], depth: number): { path: string; value: string } | null {
        if (depth > 3) return null;
        if (val === null || val === undefined) return null;

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

        if (Array.isArray(val)) {
            for (let i = 0; i < val.length; i++) {
                const res = traverse(val[i], currentPath, depth + 1);
                if (res) return res;
            }
            return null;
        }

        if (typeof val === 'object') {
            for (const key of Object.keys(val)) {
                if (key === '@context') continue;
                const res = traverse(val[key], [...currentPath, key], depth + 1);
                if (res) return res;
            }
            return null;
        }

        return null;
    }

    for (const item of rocrate["@graph"]) {
        for (const key of Object.keys(item)) {
            if (key === '@context') continue;
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
