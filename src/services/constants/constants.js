//this file will EXPORT all the constants used in the application
//read the rocrate-metadata.json file that is located at ./src/tocopy/ro-crate-metadata.json
//and return the JSON object
import axios from 'axios';
const jsonld = require('jsonld');

//import REACT_INPUT_CRATE_PATH from .env
let path_url = process.env.REACT_APP_CRATE;
console.log(path_url);

export const path_url_string = path_url;


//make function here that will get the JSON-LD from the ro-crate-metadata.json file that is located at path_url+/ro-crate-metadata.json
//and return the JSON object
export async function getJSONLD(path_url,setLoading,setGetRocrateMetadata){
    console.log("getJSONLD function called");
    console.log(path_url);
    //go from the path_url to the ro-crate-metadata.json file
    //go from https://github.com/vliz-be-opsci/test-rocrate-media => https://raw.githubusercontent.com/vliz-be-opsci/test-rocrate-media/main/ro-crate-metadata.json
    let path_url_jsonld = path_url.replace("github.com", "raw.githubusercontent.com");
    path_url_jsonld = path_url_jsonld + "/main/ro-crate-metadata.json";
    //get the JSON-LD from the ro-crate-metadata.json file
    axios.get(path_url_jsonld).then(response => {
        console.log(response.data);
        const jsonld = response.data;
        console.log(jsonld);
        setGetRocrateMetadata(jsonld);
        setLoading(false);
        return 
    });
}

//async function here that will parse a given jsonld file and return the rdf triples
//this function will be used to parse the ro-crate-metadata.json file
export async function parseJsonld(jsonld_file) {
    const rdf_version_jsonld = await jsonld.toRDF(jsonld_file, {format: 'application/nquads'});
    return rdf_version_jsonld;
}

// function that will go over all the nodes that are in the @graph of the ro-crate-metadata.jsos and will return all the node[@id] of the nodes that have the @type: "dataset" that are not a url
export async function getDatasets(rocrate_metadata) {
    let all_datasets = [];
    for (let i = 0; i < rocrate_metadata["@graph"].length; i++) {
        if (rocrate_metadata["@graph"][i]["@type"] === "Dataset" && rocrate_metadata["@graph"][i]["@id"].includes("http") === false) {
            //console.log(rocrate_metadata["@graph"][i]["@id"]);
            all_datasets.push(rocrate_metadata["@graph"][i]["@id"]);
        }
    }
    return all_datasets;
}