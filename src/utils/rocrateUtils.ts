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
        console.log("Prefix:", prefix);
        console.log("Variable:", variable);
        console.log("Rocrate context:", rocrate["@context"]);
        if (rocrate["@context"] && rocrate["@context"][prefix]) {
            return `${rocrate["@context"][prefix]}${variable.split(":")[1]}`;
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
