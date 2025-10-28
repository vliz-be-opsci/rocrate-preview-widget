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

export const getLabelForItem = (item: any): string => {
    console.log(item);
    const labels = ["schema:name", "name", "prefLabel", "title", "altLabel","skos:prefLabel", "rdfs:label", "schema:title", "dcterms:title", "dc:title"];
    for (const label of labels) {
        if (item[label]) return item[label];
    }

    return item["@id"];
};

export const getIDforItem = (item: any, rocrate_graph:any): any => {
   //search rocrate_graph which is an array of dicts and return the dict with the same id as item
   console.log(item);
   console.log(rocrate_graph);
    let item_dict = rocrate_graph.find((element:any) => element["@id"] === item);
    if (item_dict === undefined) {
        return item;
    }
    return item_dict;
}

/**
 * Returns the appropriate context link based on the provided variable and rocrate context.
 * @param rocrate - The rocrate object containing the context.
 * @param variable - The variable to resolve (e.g., "schema:Person").
 * @returns The resolved context link or a default schema.org link.
 */
export function getContextLink(rocrate: any, variable: string): string {
    if (variable.includes(":")) {
        const prefix = variable.split(":")[0];
        const suffix = variable.split(":")[1];
        console.log("Prefix:", prefix);
        console.log("Variable:", variable);
        console.log("Rocrate context:", rocrate["@context"]);
        
        if (rocrate["@context"]) {
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
            else if (context && typeof context === "object" && !Array.isArray(context) && context[prefix]) {
                return `${context[prefix]}${suffix}`;
            }
        }
    }
    return `http://schema.org/${variable}`;
}

/**
 * Extracts the root dataset dynamically from the @graph array.
 * Implements the algorithm:
 * 1. Identify `root` and `legacyroot` from `ro-crate-metadata.json` and `ro-crate-metadata.jsonld`.
 * 2. Match entities with `root` and `legacyroot`.
 * 3. Fail if no matching entity is found.
 * @param graph - The @graph array from the RO-Crate metadata.
 * @returns The root dataset entity.
 * @throws Error if no root dataset entity is found.
 */
export function extractRootData(graph: any[]): any {
    if (!graph) {
        return null;
    }
    let root: string | null = null;
    let legacyroot: string | null = null;

    console.log("Extracting root data from graph:", graph);

    

    // Step 1: Identify `root` and `legacyroot`
    for (const entity of graph) {
        console.log("Processing entity:", entity);
        if (typeof entity["@id"] === "string" && entity["@id"].endsWith("ro-crate-metadata.json") && entity["about"]) {
            root = entity["about"]["@id"];
        } else if (entity["@id"] === "ro-crate-metadata.jsonld" && entity["about"]) {
            legacyroot = entity["about"]["@id"];
        }
    }

    // Step 2: Match entities with `root`
    if (root) {
        const rootEntity = graph.find((entity) => entity["@id"] === root as string);
        console.log("Root entity found:", rootEntity);
        if (rootEntity) {
            return rootEntity;
        }
    }

    // Step 3: Match entities with `legacyroot`
    if (legacyroot) {
        const legacyRootEntity = graph.find((entity) => entity["@id"] === legacyroot as string);
        console.log("Legacy root entity found:", legacyRootEntity);
        if (legacyRootEntity) {
            return legacyRootEntity;
        }
    }

    // Step 4: Fail if no matching entity is found
    throw new Error("unknown root data entity");
}

/**
 * Checks if an item's @type includes a specific type.
 * @type can be either a string or an array of strings.
 * @param item - The item to check
 * @param type - The type to look for (e.g., "File", "Dataset")
 * @returns true if the item's @type includes the specified type
 */
export function hasType(item: any, type: string): boolean {
    if (!item || !item["@type"]) {
        return false;
    }
    
    const itemType = item["@type"];
    
    // If @type is a string, check for equality
    if (typeof itemType === "string") {
        return itemType === type;
    }
    
    // If @type is an array, check if the type is included
    if (Array.isArray(itemType)) {
        return itemType.includes(type);
    }
    
    return false;
}

/**
 * Extracts the RO-Crate specification version from the conformsTo property.
 * The conformsTo property can be either a single object with @id or an array of objects.
 * This function looks for the first @id that matches the RO-Crate specification pattern.
 * @param conformsTo - The conformsTo property value (object or array)
 * @returns The @id of the RO-Crate specification, or undefined if not found
 */
export function getRoCrateSpecVersion(conformsTo: any): string | undefined {
    // RO-Crate specification URL pattern constant
    const ROCRATE_SPEC_PATTERN = "w3id.org/ro/crate/";
    
    if (!conformsTo) {
        return undefined;
    }

    // If conformsTo is an object (not array) with @id, return it
    if (!Array.isArray(conformsTo) && typeof conformsTo === "object" && conformsTo["@id"]) {
        return conformsTo["@id"];
    }

    // If conformsTo is an array, find the first RO-Crate specification URL
    if (Array.isArray(conformsTo)) {
        for (const item of conformsTo) {
            if (item && item["@id"]) {
                // Prioritize URLs that match the RO-Crate specification pattern
                if (item["@id"].includes(ROCRATE_SPEC_PATTERN)) {
                    return item["@id"];
                }
            }
        }
        // If no RO-Crate spec URL found, return the first @id
        for (const item of conformsTo) {
            if (item && item["@id"]) {
                return item["@id"];
            }
        }
    }

    return undefined;
}
