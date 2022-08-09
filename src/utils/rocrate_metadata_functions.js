// 3th party imports here

//component imoprts here

//other util imports here

//functions here
const extract_data_files = async(metadata, setDataFiles, setLoading, setDataFilePaths) => {
    //create an empty array to store the data
    let data = [];
    let dataFilePaths = [];
    //loop through the metadata object
    for (let i = 0; i < metadata["@graph"].length; i++) {
      //create an empty object to store the data
      //if the @type of the object is File then get the @id and store all the other variables of the object in metadatda {}
      if (metadata["@graph"][i]["@type"] === "File") {
        let obj = {};
        // take te @id of the object and then spit is by / and take the last part
        obj["@id"] = metadata["@graph"][i]["@id"].split("/")[metadata["@graph"][i]["@id"].split("/").length - 1];
        obj["real_id"] = metadata["@graph"][i]["@id"];

        //split metadata["@graph"][i]["@id"] by "/" and if legth of array is bigger then 2 then split metadata["@graph"][i]["@id"] by "./" and take the last part , else leave it be
        if (metadata["@graph"][i]["@id"].split("/").length > 2) {
          //dataFilePaths.push({"path":metadata["@graph"][i]["@id"].split("./")[metadata["@graph"][i]["@id"].split("./").length - 1]});
          dataFilePaths.push({"path":metadata["@graph"][i]["@id"]});
        } else {
          dataFilePaths.push({"path":metadata["@graph"][i]["@id"]});
        }
        obj["metadata"] = [];
        for (let key in metadata["@graph"][i]) {
            obj["metadata"].push({metadata_key: key, metadata_value: metadata["@graph"][i][key]});
        }
        data.push(obj);
      }
      //push the object into the data array
    }

    //return the data array
    console.log(data);
    console.log(dataFilePaths);
    setDataFiles(data);
    setDataFilePaths(dataFilePaths);
    setLoading(false);
}

const define_constants_from_fragment_identifier = async(fragment_identifier, setCurrentDirectory, setCurrentBreadcrumb, setSelectedFile, setLastDirectory, setErrorHash) => {
  //check if fragment identifier starts with ./ => if not return false
  console.log(fragment_identifier);

  //if fragment identifier starts with # remove the #
  if (fragment_identifier.startsWith("#")) {
    fragment_identifier = fragment_identifier.substring(1);
  }
  if (fragment_identifier.length == 0){
    setCurrentDirectory('./');
    setCurrentBreadcrumb('./');
    return
  }
  if (!fragment_identifier.startsWith("./")) {
    console.log("false fragment identifier given")
    setErrorHash(true);
    return
  }
  //check if the fragment identifier ends in a / => if true then set the current breadcrumb to the fragment identifier and set the current directory to the second to last part of the fragment identifier splitted by / + "/"
  if (fragment_identifier[fragment_identifier.length - 1] == "/") {
    setCurrentBreadcrumb(fragment_identifier);
    setCurrentDirectory(fragment_identifier.split("/")[fragment_identifier.split("/").length - 2]+"/");
    setLastDirectory('./');
  }
  //check if the last part of the fragment identifier splitted by "/" contains a "." => if so then set the selected file to the last part of the fragment identifier splitted by "/"
  else if (fragment_identifier.split("/")[fragment_identifier.split("/").length - 1].includes(".")) {
    setSelectedFile(fragment_identifier.split("/")[fragment_identifier.split("/").length - 1]);
    var file = fragment_identifier.split("/")[fragment_identifier.split("/").length - 1];
    //set current directory to the second to last part of the fragment identifier splitted by "/" + "/"
    setCurrentDirectory(fragment_identifier.split("/")[fragment_identifier.split("/").length - 2]+"/");
    //set current breadcrumb to the first part of the fragment identifier splitted by file
    setCurrentBreadcrumb(fragment_identifier.split(file)[0]);
    setLastDirectory('./');
  }else{
    setErrorHash(true);
  }
}

const check_name_file_display = (filename) => {
  //if filename is bigger then 15 characters, take the first 3 and every char after the "." and the 3 charcaters before the . and place 3 doss between them
  console.log(filename);
  console.log(filename.length);
  if (filename.length > 20) {
    try {
      //get the first 3 characters
      var first_three = filename.substring(0,12);
      //get the part after the "."
      var part_after_dot = filename.split(".")[1];
      //get the 3 characters before the "."
      var part_before_dot = filename.split(".")[0].substring(filename.split(".")[0].length - 3, filename.split(".")[0].length);
      //create a new string with the first 3 characters, 3 doss and the part after the "."
      var new_string = first_three + "..." + part_before_dot + "." + part_after_dot;

      let new_name = new_string;
      
      return new_name;
    } catch (error) {
      console.log(error);
      return filename;
    }
    
  }else{
    return filename;
  }
}

const get_data_file_paths = async(metadata,root, path) => {
    //create an empty array to store the data
    let data = [];
    console.log(root);
    console.log(path);
    //loop through the metadata object
    for (let i = 0; i < metadata["@graph"].length; i++) {
      //if the @id of the object is the same as the given path then look if it hasParts
      if (metadata["@graph"][i]["@id"] === path) {
        var new_root = root + metadata["@graph"][i]["@id"];
        //console.log(new_root);
        data.push({"path":new_root});
        //if it hasParts then loop over the parts and append to the given array
        if (metadata["@graph"][i]["hasParts"]) {
          for (let j = 0; j < metadata["@graph"][i]["hasParts"].length; j++) {
            //check if part has a / in its @id => if so then get_data_file_paths
            if (metadata["@graph"][i]["hasParts"][j]["@id"].includes("/")) {
              let returnarray = get_data_file_paths(new_root, metadata["@graph"][i]["hasParts"][j]["@id"]);
              //append each entry to the given array
              for (let k = 0; k < returnarray.length; k++) {
                data.push(returnarray[k]);
              }
            }
            //if not then append to the given array
            else {
              let obj = {}
              obj["path"] = new_root + metadata["@graph"][i]["hasParts"][j]["@id"];
              data.push(obj);
            }
          }
        }
      }
    }
    return data;
}

const reciproce_path_making = async(data, setDataFilePaths) => {
    var endfunction = true;
    for (let i = 0; i < data.length; i++) {
      //if the first character is a . then also copy _piece and the last char is a /
      if (!data[i]["path"].includes(".") || data[i]["path"][0] == "." && data[i]["path"][data[i]["path"].length - 1] == "/") {
        //splice the first character of the path 
        var non_first_char = data[i]["path"].substring(1);
        //check if there is a . in the non_first_char
        if (!non_first_char.includes(".")) {
          endfunction = false;
          //console.log(data[i]["path"]);
          var _piece = data[i]["path"];
          //loop over the data again and add the _piece to the path
          for (let j = 0; j < data.length; j++) {
            //check if the second to last part of the _piece splitted by / is in the first part of the part
            var last_part = _piece.split("/")[_piece.split("/").length - 2];
            var first_part_tocheck = data[j]["path"].split("/")[0];
            if (first_part_tocheck == last_part) {
              //replace the first part of the path with the _piece
              var replacement = _piece.slice(0, -1) + data[j]["path"].substring(first_part_tocheck.length);
              //console.log(replacement);
              data[j]["path"] = replacement;
            }
          }
          //delete the path from the current array
          data.splice(i, 1);
          //console.log(data);
        }
      }
    }
    if(endfunction){console.log("end of reciproce");console.log(data);setDataFilePaths(data)}else{reciproce_path_making(data)}
}

// function that will loop over the metadata and create paths to the data files that can be served for downloading the data 
const create_data_file_paths = async(metadata, setDataFilePaths) => {
    //create an empty array to store the data
    let data = [];
    //loop through the metadata object
    for (let i = 0; i < metadata["@graph"].length; i++) {
      //if the @type of the object is Dataset then make a path to the data file
      if (metadata["@graph"][i]["@type"] === "Dataset") {
        let obj = {};
        var root = metadata["@graph"][i]["@id"];
        //for item in hasPart get the @id and add prefix the root to it to make the path
        for (let j = 0; j < metadata["@graph"][i]["hasPart"].length; j++) {
          //check if the hasPart ends with a / in its @id => if so then get_data_file_paths
          if (metadata["@graph"][i]["hasPart"][j]["@id"].endsWith("/")) {
            let returnarray = get_data_file_paths(root, metadata["@graph"][i]["hasPart"][j]["@id"]);
            //append each entry to the given array
            for (let k = 0; k < returnarray.length; k++) {
              data.push(returnarray[k]);
            }
          }
          //if not then append to the given array
          else {
            let obj = {}
            obj["path"] = root + metadata["@graph"][i]["hasPart"][j]["@id"];
            data.push(obj);
          }
        }
      }
    }
    //loop over the data and if the path doesn't contain a . then prepend it to all the other paths that contain everything after the first / laslty delete the path from the current array
    reciproce_path_making(data, setDataFilePaths);
}

const find_path_in_data = async(id, dataFilePaths) => {
  //loop over the data array
  for (let i = 0; i < dataFilePaths.length; i++) {
      //if the path contains the id then return the path
      if (dataFilePaths[i]["path"].includes(id)) {
        return dataFilePaths[i]["path"];
      }
    }
}

//export functions here
export {
    extract_data_files,
    get_data_file_paths,
    create_data_file_paths,
    reciproce_path_making,
    find_path_in_data,define_constants_from_fragment_identifier,
    check_name_file_display
}

