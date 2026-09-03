import { QueryEngine } from '@comunica/query-sparql';

export async function fetchFacetValues(storeRef: any, predicate: string): Promise<string[]> {
    const engine = new QueryEngine();
    console.log("Fetching facet values...");
    console.log("Store size:", storeRef.size);
    console.log("Predicate:", predicate);
    const query = `
        SELECT DISTINCT ?o WHERE {
            ?s <${predicate}> ?o
        }
    `;
    console.log("Query:", query);
    const result = await engine.queryBindings(query, {
        sources: [{ type: 'rdfjsSource', value: storeRef}]
    });
    console.log("Facets result:", result);

    const results: string[] = [];
    result.on('data', (binding) => {
        const value = binding.get('o');
        console.log("Binding:", binding);
        console.log("Value:", value);
        if (value) {
            results.push(value.value);
        }
    });

    return new Promise((resolve, reject) => {
        result.on('end', () => resolve(results));
        result.on('error', reject);
    });
}

export interface RoCrateVersionInfo {
    specVersion: "1.0" | "1.1" | "1.2" | "unknown";
    specUri: string | null;
    isDetached: boolean;
    isProfileCrate: boolean;
    profiles: string[];
}

export function detectRoCrateVersion(rocrate: any): RoCrateVersionInfo {
    const defaultInfo: RoCrateVersionInfo = {
        specVersion: "unknown",
        specUri: null,
        isDetached: false,
        isProfileCrate: false,
        profiles: []
    };

    if (!rocrate || typeof rocrate !== "object") {
        return defaultInfo;
    }

    const profilesSet = new Set<string>();
    let detectedVersion: "1.0" | "1.1" | "1.2" | "unknown" = "unknown";
    let specUri: string | null = null;
    let isProfileCrate = false;

    const checkVersionString = (str: string) => {
        if (!str || typeof str !== "string") return;
        if (str.includes("w3id.org/ro/crate/1.2")) {
            detectedVersion = "1.2";
            specUri = "https://w3id.org/ro/crate/1.2";
        } else if (str.includes("w3id.org/ro/crate/1.1") && detectedVersion !== "1.2") {
            detectedVersion = "1.1";
            specUri = "https://w3id.org/ro/crate/1.1";
        } else if ((str.includes("w3id.org/ro/crate/1.0") || str.includes("ro-crate-metadata.jsonld")) && detectedVersion === "unknown") {
            detectedVersion = "1.0";
            specUri = "https://w3id.org/ro/crate/1.0";
        }
    };

    // 1. Inspect @context
    const context = rocrate["@context"];
    if (typeof context === "string") {
        checkVersionString(context);
    } else if (Array.isArray(context)) {
        for (const c of context) {
            if (typeof c === "string") {
                checkVersionString(c);
            }
        }
    }

    const graph = Array.isArray(rocrate["@graph"]) ? rocrate["@graph"] : [];

    // Helper to extract conformsTo entries
    const extractConformsTo = (conformsTo: any) => {
        if (!conformsTo) return;
        const items = Array.isArray(conformsTo) ? conformsTo : [conformsTo];
        for (const item of items) {
            const id = typeof item === "string" ? item : item?.["@id"];
            if (id && typeof id === "string") {
                if (id.includes("w3id.org/ro/crate/")) {
                    checkVersionString(id);
                } else {
                    profilesSet.add(id);
                }
            }
        }
    };

    // 2. Inspect descriptor (ro-crate-metadata.json or legacy ro-crate-metadata.jsonld)
    const descriptor = graph.find((entity: any) =>
        typeof entity?.["@id"] === "string" &&
        (entity["@id"].endsWith("ro-crate-metadata.json") || entity["@id"] === "ro-crate-metadata.jsonld")
    );

    if (descriptor) {
        if (descriptor["@id"] === "ro-crate-metadata.jsonld" && detectedVersion === "unknown") {
            detectedVersion = "1.0";
            specUri = "https://w3id.org/ro/crate/1.0";
        }
        if (hasType(descriptor, "Profile")) {
            isProfileCrate = true;
        }
        extractConformsTo(descriptor["conformsTo"]);
    }

    // 3. Inspect root dataset (conformsTo in 1.2 is placed on the Root Data Entity)
    try {
        const rootEntity = extractRootData(graph);
        if (rootEntity) {
            extractConformsTo(rootEntity["conformsTo"]);
        }
    } catch {
        // Root entity extraction might fail for incomplete crates, ignore here
    }

    // 4. Detached check: if files have absolute URIs
    const isDetached = graph.some((item: any) =>
        hasType(item, "File") && typeof item["@id"] === "string" && (item["@id"].startsWith("http://") || item["@id"].startsWith("https://"))
    );

    return {
        specVersion: detectedVersion,
        specUri: specUri || (detectedVersion !== "unknown" ? `https://w3id.org/ro/crate/${detectedVersion}` : null),
        isDetached,
        isProfileCrate,
        profiles: Array.from(profilesSet)
    };
}

export function getPartId(part: any): string {
    if (!part) return "";
    if (typeof part === "string") return part;
    if (typeof part === "object" && part["@id"]) return part["@id"];
    return "";
}

export function getFileDownloadUrl(item: any): string | undefined {
    if (!item || typeof item !== "object") return undefined;
    return item["contentUrl"] || item["downloadUrl"] || item["downloadURL"] || undefined;
}

export const getLabelForItem = (item: any): string => {
    if (typeof item === "string") {
        return item;
    }
    if (!item || typeof item !== "object") {
        return String(item || "");
    }
    const labels = [
        "schema:name",
        "https://schema.org/name",
        "http://schema.org/name",
        "name",
        "dct:title",
        "dcterms:title",
        "title",
        "prefLabel",
        "skos:prefLabel",
        "rdfs:label",
        "schema:title",
        "dc:title",
        "altLabel"
    ];
    for (const label of labels) {
        if (item[label]) {
            return typeof item[label] === "string" ? item[label] : JSON.stringify(item[label]);
        }
    }

    return item["@id"] || item["name"] || item["title"] || "";
};

export const getIDforItem = (item: any, rocrate_graph: any): any => {
    if (!rocrate_graph || !Array.isArray(rocrate_graph)) {
        return item;
    }
    const itemId = typeof item === "string" ? item : item?.["@id"];
    if (!itemId) {
        return item;
    }
    let item_dict = rocrate_graph.find((element: any) => element && element["@id"] === itemId);
    if (item_dict === undefined) {
        return item;
    }
    return item_dict;
};

/**
 * Returns the appropriate context link based on the provided variable and rocrate context.
 * @param rocrate - The rocrate object containing the context.
 * @param variable - The variable to resolve (e.g., "schema:Person").
 * @returns The resolved context link or a default schema.org link.
 */
export function getContextLink(rocrate: any, variable: any): string {
    const varStr = Array.isArray(variable) ? (variable[0] || "") : String(variable || "");
    if (!varStr) return "http://schema.org/";

    // If variable is already a full URL, return it as-is
    if (varStr.startsWith("http://") || varStr.startsWith("https://")) {
        return varStr;
    }

    if (varStr.includes(":")) {
        const prefix = varStr.split(":")[0];
        const suffix = varStr.split(":")[1];
        
        if (rocrate && rocrate["@context"]) {
            const context = rocrate["@context"];
            
            // Handle array context (e.g., ["https://...", {"dct": "http://..."}])
            if (Array.isArray(context)) {
                for (const contextItem of context) {
                    if (contextItem && typeof contextItem === "object" && !Array.isArray(contextItem) && contextItem[prefix]) {
                        return `${contextItem[prefix]}${suffix}`;
                    }
                }
            }
            // Handle object context (e.g., {"dct": "http://..."})
            else if (typeof context === "object" && !Array.isArray(context) && context[prefix]) {
                return `${context[prefix]}${suffix}`;
            }
        }
    }
    return `http://schema.org/${varStr}`;
}

/**
 * Extracts the root dataset dynamically from the @graph array.
 * Supports both RO-Crate 1.1 (object about: {"@id": "./"}) and RO-Crate 1.2 (string about: "./").
 * @param graph - The @graph array from the RO-Crate metadata.
 * @returns The root dataset entity.
 * @throws Error if no root dataset entity is found.
 */
export function extractRootData(graph: any[]): any {
    if (!graph || !Array.isArray(graph) || graph.length === 0) {
        return null;
    }
    let root: string | null = null;
    let legacyroot: string | null = null;

    console.log("Extracting root data from graph:", graph);

    // Step 1: Identify `root` and `legacyroot`
    for (const entity of graph) {
        if (!entity || typeof entity !== "object") continue;
        if (typeof entity["@id"] === "string" && entity["@id"].endsWith("ro-crate-metadata.json") && entity["about"]) {
            const about = entity["about"];
            if (typeof about === "string") {
                root = about;
            } else if (typeof about === "object" && !Array.isArray(about) && about["@id"]) {
                root = about["@id"];
            } else if (Array.isArray(about) && about.length > 0) {
                root = typeof about[0] === "string" ? about[0] : about[0]?.["@id"];
            }
        } else if (entity["@id"] === "ro-crate-metadata.jsonld" && entity["about"]) {
            const about = entity["about"];
            if (typeof about === "string") {
                legacyroot = about;
            } else if (typeof about === "object" && !Array.isArray(about) && about["@id"]) {
                legacyroot = about["@id"];
            } else if (Array.isArray(about) && about.length > 0) {
                legacyroot = typeof about[0] === "string" ? about[0] : about[0]?.["@id"];
            }
        }
    }

    // Step 2: Match entities with `root`
    if (root) {
        const rootEntity = graph.find((entity) => entity && entity["@id"] === root);
        if (rootEntity) {
            return rootEntity;
        }
    }

    // Step 3: Match entities with `legacyroot`
    if (legacyroot) {
        const legacyRootEntity = graph.find((entity) => entity && entity["@id"] === legacyroot);
        if (legacyRootEntity) {
            return legacyRootEntity;
        }
    }

    // Step 4: Fallback - Look for entity with @id "./"
    const dotSlashEntity = graph.find((entity) => entity && entity["@id"] === "./");
    if (dotSlashEntity) {
        return dotSlashEntity;
    }

    // Step 5: Fallback - Look for any Dataset entity with hasPart
    const fallbackDataset = graph.find((entity) => entity && hasType(entity, "Dataset") && entity.hasPart);
    if (fallbackDataset) {
        return fallbackDataset;
    }

    // Step 6: Fail if no matching entity is found
    throw new Error("unknown root data entity");
}

/**
 * Checks if an item's @type includes a specific type.
 * Supports short form ("Dataset"), prefixed ("schema:Dataset"), and full URI ("https://schema.org/Dataset").
 * @param item - The item to check
 * @param type - The type to look for (e.g., "File", "Dataset")
 * @returns true if the item's @type includes the specified type
 */
export function hasType(item: any, type: string): boolean {
    if (!item || !item["@type"]) {
        return false;
    }
    
    const itemType = item["@type"];
    
    const matches = (t: any): boolean => {
        if (typeof t !== "string") return false;
        if (t === type) return true;
        if (t === `http://schema.org/${type}` || t === `https://schema.org/${type}`) return true;
        if (t === `schema:${type}`) return true;
        return false;
    };

    if (typeof itemType === "string") {
        return matches(itemType);
    }
    
    if (Array.isArray(itemType)) {
        return itemType.some((t) => matches(t));
    }
    
    return false;
}

/**
 * Extracts the RO-Crate specification version from the conformsTo property.
 * The conformsTo property can be a string URL, a single object with @id, or an array of objects/strings.
 * @param conformsTo - The conformsTo property value (string, object or array)
 * @returns The @id of the RO-Crate specification, or undefined if not found
 */
export function getRoCrateSpecVersion(conformsTo: any): string | undefined {
    const ROCRATE_SPEC_PATTERN = "w3id.org/ro/crate/";
    
    if (!conformsTo) {
        return undefined;
    }

    // Direct string URL
    if (typeof conformsTo === "string") {
        return conformsTo;
    }

    // If conformsTo is an object with @id
    if (!Array.isArray(conformsTo) && typeof conformsTo === "object" && conformsTo !== null && conformsTo["@id"]) {
        return conformsTo["@id"];
    }

    // If conformsTo is an array
    if (Array.isArray(conformsTo)) {
        for (const item of conformsTo) {
            const id = typeof item === "string" ? item : item?.["@id"];
            if (id && typeof id === "string" && id.includes(ROCRATE_SPEC_PATTERN)) {
                return id;
            }
        }
        for (const item of conformsTo) {
            const id = typeof item === "string" ? item : item?.["@id"];
            if (id && typeof id === "string") {
                return id;
            }
        }
    }

    return undefined;
}
