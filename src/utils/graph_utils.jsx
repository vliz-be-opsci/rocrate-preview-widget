//this file will contain all utility functions related to graph

//function that will check if a given value that can be an array or a string is equal to a given string value , return true if it is equal
export const checkIfValueIsEqual = (value, valueToCompare) => {
    if (Array.isArray(value)) {
        return value.includes(valueToCompare);
    } else {
        return value === valueToCompare;
    }
    }

//this function will search for specific values that accociate the lavel for a given graph node and return the value of the label
export const getLabelValue = (node) => {
    //dct:title | http://purl.org/dc/terms/title | title
    //schema:name | http://schema.org/name | name
    //skos:prefLabel | http://www.w3.org/2004/02/skos/core#prefLabel | prefLabel
    //rdfs:label | http://www.w3.org/2000/01/rdf-schema#label | label
    //rdfs:comment | http://www.w3.org/2000/01/rdf-schema#comment | comment

    let labelValue = node['@id'];
    console.log(node);
    //first check if keys exist
    if (node['dct:title'] || node['http://purl.org/dc/terms/title'] || node["title"]) {
        labelValue = node['dct:title'] || node['http://purl.org/dc/terms/title'] || node["title"];
        return labelValue;
    }
    if (node['schema:name'] || node['http://schema.org/name'] || node["name"]) {
        labelValue = node['schema:name'] || node['http://schema.org/name'] || node["name"];
        return labelValue;
    }
    if (node['skos:prefLabel'] || node['http://www.w3.org/2004/02/skos/core#prefLabel'] || node["prefLabel"]) {
        labelValue = node['skos:prefLabel'] || node['http://www.w3.org/2004/02/skos/core#prefLabel'] || node["prefLabel"];
        return labelValue;
    }
    if (node['rdfs:label'] || node['http://www.w3.org/2000/01/rdf-schema#label'] || node["label"]) {
        labelValue = node['rdfs:label'] || node['http://www.w3.org/2000/01/rdf-schema#label'] || node["label"];
        return labelValue;
    }
    if (node['rdfs:comment'] || node['http://www.w3.org/2000/01/rdf-schema#comment'] || node["comment"]) {
        labelValue = node['rdfs:comment'] || node['http://www.w3.org/2000/01/rdf-schema#comment'] || node["comment"];
        return labelValue;
    }
    return labelValue;
}

//function to get specific item with @id from graph
export const getItemFromGraph = (graph, id) => {
    let item = null;
    console.log(graph);
    graph.forEach((node) => {
        if (node['@id'] === id) {
            item = node;
        }
    });
    return item;
}