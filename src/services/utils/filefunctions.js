//this file will contain all functions that are used to manipulate the file system
const mime = require('mime');

const get_file_type = (file) => {
    //get extention of the file
    let extention = file.split(".").pop();
    //get mimetype of the extention
    let mimetype = mime.getType(extention);
    return mimetype;
}

const getTreeData = (props,setTreeInfo,setOriginalTree,setFullSortedData,search_term) => {
    //get the @graph property from the props
    let graph = props["@graph"];
    console.log(props);
    console.log("search term is: " + search_term);

    // filter the graph to only include the objects that have the search term in their @id
    let filtered_graph = graph.filter((object) => {
        return object["@id"].includes(search_term);
    });
    //print length of filted graph
    console.log("length of filtered graph is: " + filtered_graph.length);

    //console.log(graph);
    //create an empty array to store the datasets
    let treedata = [];
    //loop through all the items in the @graph property and check if the item is a File and also not an url
    let intermediate_data = [];
    filtered_graph.forEach((item) => {
        if (item["@type"] === "File" && item["@id"].indexOf("http") === -1) {
            //if the item is a File and not an url, then push the item to the treedata array
            //split the item by the / and get the last item in the array
            //this will be the name of the file
            const filename = item["@id"].split("/").pop();
            //split the item by the / and loop over the array 
            //and push the items to the treedata array
            const file_path = item["@id"].split("/");
            //loop over file_path 
            for(let i = 0; i < file_path.length; i++) {
                //check if the item is the last item in the array
                const full_path_name = file_path.slice(0, i+1).join("/");
                if (i === file_path.length - 1) {intermediate_data.push({"name":filename,"type":"file","level":i,"parent":file_path[i-1],"full_name":full_path_name});}
                else {
                    try {

                        intermediate_data.push({"name":file_path[i],"type":"folder","level":i,"parent":file_path[i-1],"full_name":full_path_name});
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    })
    console.log(intermediate_data);
    //make an array where all dict are sorted by level from high to low
    let sorted_data = intermediate_data.sort((a,b) => (a.level > b.level) ? -1 : ((b.level > a.level) ? 1 : 0));
    
    //delete all the items that are level 0
    sorted_data = sorted_data.filter((item) => item.level !== 0);
    // filter out all the duplicate items
    sorted_data = sorted_data.filter((item, index, self) => index === self.findIndex((t) => (t.name === item.name && t.level === item.level && t.parent === item.parent)));
    console.log(sorted_data);
    let reverse_construct = [];
    //loop over the sorted_data array and construct the tree
    sorted_data.forEach((item) => {
        console.log("file");
        //check if the parent of the file is in the construct array
        if (reverse_construct.filter((construct) => construct.name === item.parent).length > 0) {
            //if the parent is in the construct array, then add the file to the parent
            reverse_construct.forEach((construct) => {
                if (construct.name === item.parent) {
                    construct.content.push(item.name);
                }
            })
        }else{
            //if the parent is not in the construct array, then add the parent and the file to the construct array
            reverse_construct.push({"name":item.parent,"content":[item.name]});
        }
    })
    console.log(reverse_construct);
    //loop over the reverse_construct array, get the item.name and check if this item.name is present in any of the other reverse_construct items.content
    //if the item.name is present in any of the other reverse_construct items.content, then add the item to the content of the other item
    reverse_construct.forEach((item) => {
        var found = false;
        reverse_construct.forEach((construct) => {
            if (construct.content.includes(item.name)) {
                found = true;
                construct.content.push(item);
                construct.content = construct.content.filter((content) => content !== item.name);
            }
        })
        if (found === true) {
            reverse_construct = reverse_construct.filter((construct) => construct.name !== item.name);
        }
    });
    console.log(reverse_construct);
    //if reverse contruct is empty then don't do anything
    if (reverse_construct.length > 0) {
        treedata.push({"name":".","content":reverse_construct[0].content});
    }
    //now we get all the items from the graph that are urls
    //loop through all the items in the @graph property and check if the item is a File and also not an url
    let resource_data = [];
    filtered_graph.forEach((item) => {
        //if the item[@type] is not a Dataset or a File and also not an url, then push the item to the treedata array
        if(item["@type"] !== "Dataset" && item["@type"] !== "File") {
            resource_data.push(item["@id"]);
        }
    })
    //if resource_data is not empty, then add the resource_data to the treedata
    if (resource_data.length > 0) {
        treedata.push({"name":"Resources","content":resource_data});
    }
    setTreeInfo(treedata);
    setOriginalTree(treedata);
    setFullSortedData(sorted_data);
}

//export all necessary functions
export { getTreeData , get_file_type};