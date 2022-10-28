//this file will EXPORT all the constants used in the application
//read the rocrate-metadata.json file that is located at ./src/tocopy/ro-crate-metadata.json
//and return the JSON object
const jsonld = require('jsonld');
const rocratemetadata = require("../../tocopy/ro-crate-metadata.json");
console.log(rocratemetadata);
export const getRocrateMetadata = rocratemetadata;
//async function here that will parse a given jsonld file and return the rdf triples
//this function will be used to parse the ro-crate-metadata.json file
export async function parseJsonld(jsonld_file) {
    const rdf_version_jsonld = await jsonld.toRDF(jsonld_file, {format: 'application/nquads'});
    return rdf_version_jsonld;
}

// function that will go over all the nodes that are in the @graph of the ro-crate-metadata.jsos and will return all the node[@id] of the nodes that have the @type: "dataset" that are not a url
export function getDatasets(rocrate_metadata) {
    let all_datasets = [];
    for (let i = 0; i < rocrate_metadata["@graph"].length; i++) {
        if (rocrate_metadata["@graph"][i]["@type"] === "Dataset" && rocrate_metadata["@graph"][i]["@id"].includes("http") === false) {
            //console.log(rocrate_metadata["@graph"][i]["@id"]);
            all_datasets.push(rocrate_metadata["@graph"][i]["@id"]);
        }
    }
    return all_datasets;
}