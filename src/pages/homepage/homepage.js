//imports here
import React, {useEffect,useState} from 'react';
import PreviewFile from '../../components/preview_file/preview_file';
import ReactMarkdown from 'react-markdown';
import MarkdownReadme from '../../components/markdown_readme/markdown_readme';
import './homepage.css';


const mime = require('mime');

function HomePage() {
    //constants
  const [dataFiles, setDataFiles] = useState([]);
  const [dataFilePaths, setDataFilePaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentdirectory, setCurrentDirectory] = useState('./');
  const [lastdirectory, setLastDirectory] = useState('');
  const [selectedfile, setSelectedFile] = useState('');

  //import the rocrate-metadata-json file and store it in a variable
  const metadata = require('../../tocopy/ro-crate-metadata.json');

  // dismantle the metadata object and store it in variables
  const profile_conforms_to = metadata["@context"];

  //create function to extract all the data from the metadata object
  function extract_data_files(metadata) {
    //create an empty array to store the data
    let data = [];
    //loop through the metadata object
    for (let i = 0; i < metadata["@graph"].length; i++) {
      //create an empty object to store the data
      //if the @type of the object is File then get the @id and store all the other variables of the object in metadatda {}
      if (metadata["@graph"][i]["@type"] === "File") {
        let obj = {};
        obj["@id"] = metadata["@graph"][i]["@id"];
        obj["metadata"] = [];
        for (let key in metadata["@graph"][i]) {
            obj["metadata"].push({metadata_key: key, metadata_value: metadata["@graph"][i][key]});
        }
        data.push(obj);
      }
      //push the object into the data array
    }
    //return the data array
    setDataFiles(data);
    setLoading(false);
  }

  //function that will take a given path and loop over the matadata to find its @id and then look if it hasParts and append to the given array
  function get_data_file_paths(root ,path) {
    //create an empty array to store the data
    let data = [];
    //console.log(root);
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

  function reciproce_path_making(data){
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
  function create_data_file_paths(metadata) {
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
          //check if the hasPart has a / in its @id => if so then get_data_file_paths
          if (metadata["@graph"][i]["hasPart"][j]["@id"].includes("/")) {
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
    reciproce_path_making(data);

  }

  //function to find a given path in the data array given a id
  function find_path_in_data(id) {
    //loop over the data array
    for (let i = 0; i < dataFilePaths.length; i++) {
      //if the path contains the id then return the path
      if (dataFilePaths[i]["path"].includes(id)) {
        return dataFilePaths[i]["path"];
      }
    }
  }

  //run the function to extract the data on mount 
  useEffect(() => {create_data_file_paths(metadata);}, []);
  useEffect(() => {extract_data_files(metadata);} , [dataFilePaths]);

  //extract the current url
  let url = window.location.href;

  //child component to display metadata
  function Metadata(props) {
    //if props.metadata.length is greater than 0 then display the metadata
    if (props.metadata.length > 0) {
    return (
      <div className="metadata">
        <table>
          <tbody>
            {props.metadata.map((metadata) => (
              <tr>
                <td>{metadata["metadata_key"]}</td>
                <td>{metadata["metadata_value"] !== null && typeof metadata["metadata_value"] !== "object" ? metadata["metadata_value"] : "object or null"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    }
    return(<></>);
  }

  //child function that will determine if there is a go back button and a ./ button
    function GoBack(props) {
        var unique = props.dir_paths;
        console.log(unique);
        //if lastdirectory == "" then there is no go back button
        if (lastdirectory == "") {
            return(<></>);
        }
        //if current directory is "./" then there is no go back button
        else if (currentdirectory == "./") {
            return(<></>);
        }
        //if lastdirectory is not "" and current directory is not "./" then display the go back button
        else {
            //if lastdirectory == './' only return one button
            if (lastdirectory == './') {
                return(
                    <button onClick={() => {
                        //set the current directory to the last directory
                        setCurrentDirectory(lastdirectory);
                        //set the last directory to the current directory
                        setLastDirectory(currentdirectory);
                        setSelectedFile("");
                    }
                    }>{lastdirectory}</button>
                )
                
            }else{
                //if lastdirectory is in the unique array then display the go back button
                if (unique.includes(lastdirectory)) {
                    return(
                        <div className="go-back">
                            <button onClick={() => {
                                //set the current directory to the root directory
                                setCurrentDirectory("./");
                                //set the last directory to the current directory
                                setLastDirectory(currentdirectory);
                                setSelectedFile("");
                            }}>./</button>
                        </div>
                    );
                }else{
                    return(
                        <div className="go-back">
                            <button onClick={() => {
                                //set the current directory to the last directory
                                setCurrentDirectory(lastdirectory);
                                //set the last directory to the current directory
                                setLastDirectory(currentdirectory);
                                setSelectedFile("");
                            }
                            }>{lastdirectory}</button>
                            <button onClick={() => {
                                //set the current directory to the root directory
                                setCurrentDirectory("./");
                                //set the last directory to the current directory
                                setLastDirectory(currentdirectory);
                                setSelectedFile("");
                            }}>./</button>
                        </div>
                    );
                }
            }
        }
    }

  // child component that will render the README.md file if there is a readme file in the current directory
  function ReadMe() {
    //first find all the path in the current folder
    let possible_readme_paths = [];
    for (let i = 0; i < dataFilePaths.length; i++) {
      //if the path contains the id then return the path
      if (dataFilePaths[i]["path"].includes(currentdirectory)) {
        possible_readme_paths.push(dataFilePaths[i]["path"]);
      }
    }
    //loop over the possible readme paths
    for (let i = 0; i < possible_readme_paths.length; i++) {
      //if the path contains the readme file then return the path
      if (possible_readme_paths[i].includes("README.md")) {
        console.log(possible_readme_paths[i]);
        return (
            <MarkdownReadme url={possible_readme_paths[i]} currentdir={currentdirectory}/>
        );
      }
    }
    return(<></>);
  }

  function Currentnavigation() {
    var unique_paths = [];
    //loop over the metadata grapths and get all the dirs of the currentdirectry
    for (let i = 0; i < metadata["@graph"].length; i++) {
        //if the current directory is the same as the current directory then add it to the unique_paths array
        if (metadata["@graph"][i]["@id"] === currentdirectory) {
            //look into the hasparts and get all the dirs
            for (let j = 0; j < metadata["@graph"][i]["hasPart"].length; j++) {
                //if last part is / then add to the unique_paths array
                if (metadata["@graph"][i]["hasPart"][j]["@id"].split("/")[metadata["@graph"][i]["hasPart"][j]["@id"].split("/").length - 1] === "") {
                    unique_paths.push(metadata["@graph"][i]["hasPart"][j]["@id"]);
                }
            }
        }
    }

    //return a list of all the unique paths
    return (
        <div className="currentnavigation">
            {unique_paths.map((unique_path) => (
                <button onClick={() => { setLastDirectory(currentdirectory); setCurrentDirectory(unique_path);setSelectedFile("");}}>{unique_path}</button>
            ))}
            <GoBack dir_paths = {unique_paths}/>
        </div>
    );
  }

  //function that will  get the type of the file that was given
  function get_file_type(file) {
    //get extention of the file
    let extention = file.split(".").pop();
    //get mimetype of the extention
    let mimetype = mime.getType(extention);
    return mimetype;
  }


  //child function that return an overview of the given file @id
    function FileOverview(props) {
        var file_id = props.file_id;

        // if file_d == none or "" then return nothing
        if (file_id == "none" || file_id == "") {
            return(<></>);
        }

        //loop over the datafiles and find the file with the given id
        for (let i = 0; i < dataFiles.length; i++) {
            //if the datafile id is the same as the given id then return the datafile
            if (dataFiles[i]["@id"] === file_id) {
                var metadata = <Metadata metadata={dataFiles[i]["metadata"]}/>;
                var path = find_path_in_data(file_id);
                var folder_file = path.split("/")[path.split("/").length - 2];
                var mimetype = get_file_type(file_id);
                return(  
                  <div className='fileitem'> 
                      <span id='close' onClick={() => setSelectedFile("")}>X</span>
                      <h4>Folder file : {folder_file}</h4>
                      <h5>Mimetype : {mimetype}</h5>
                      <PreviewFile file_mimetype={mimetype} file_url={path}/>
                      <a href = {path} ><p>{file_id}</p></a>
                      {metadata}
                  </div>
                )
            }
        }
    }



  if(loading){
    return(
      <div className="App">
        <div className="loader">
          <div className="loader-inner">loading data</div>
        </div>
      </div>
    )
  }
  else{
    return (
      <>
        <ReadMe></ReadMe>
        <div className='fileitem'>
            <h4>Current Directory : {currentdirectory}</h4>
            <Currentnavigation/>
        </div>
        <div className='fileitem'>
            {dataFilePaths.map((item, index) => {
                var folder_file = item["path"].split("/")[item["path"].split("/").length - 2];
                var file_id = item["path"].split("/")[item["path"].split("/").length - 1];
                if (folder_file == currentdirectory.split("/")[0]){
                    return(
                        <button onClick={() => {setSelectedFile(file_id)}}>{file_id}</button>
                    )
                }
            })}
        </div>
        <FileOverview file_id = {selectedfile}/>
    </>
    );
  }
}

export default HomePage;

/*
{dataFiles.map((item, index) => {
          var metadata = <Metadata metadata={item["metadata"]} /> 
          var path = find_path_in_data(item["@id"]);
          //get second to last element of the path
          var folder_file = path.split("/")[path.split("/").length - 2];
          return (
            <>
              <div className='fileitem'> 
                <h4>Folder file : {folder_file}</h4>
                <a href = {path} ><p>{item["@id"]}</p></a>
                {metadata}
              </div>
            </>
          )
        })}
*/ 
