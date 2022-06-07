//3th party imports here
import React, {useEffect,useState} from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import {AiOutlineCloudDownload} from 'react-icons/ai';
//component inports here
import MarkdownReadme from '../markdown_readme/markdown_readme';
import PreviewFile from '../preview_file/preview_file';

//import util functions here
import {check_name_file_display } from '../../utils/rocrate_metadata_functions';

//css import here
import './file_panel.css';

const mime = require('mime');

function FilePanel(props) {
    //constants
    const selectedfile = props.selectedfile;
    const setSelectedFile = props.setSelectedFile;
    const currentdirectory = props.currentdirectory;
    const dataFilePaths = props.dataFilePaths;
    const dataFiles = props.dataFiles;
    const currentbreadcrumb = props.currentbreadcrumb;
    //functions

    // child component that will render the README.md file if there is a readme file in the current directory
    function ReadMe(props) {
        //first find all the path in the current folder
        let possible_readme_paths = [];
        console.log(props.dataFilePaths);
        console.log(props.currentbreadcrumb);
        for (let i = 0; i < props.dataFilePaths.length; i++) {
        //if the path contains the id then return the path
          if (props.dataFilePaths[i]["path"].includes(props.currentdirectory)) {
              possible_readme_paths.push(props.dataFilePaths[i]["path"]);
          }
        }
        console.log(possible_readme_paths);
        //loop over the possible readme paths
        for (let i = 0; i < possible_readme_paths.length; i++) {
        //if the path contains the readme file then return the path
        if (possible_readme_paths[i].includes("README.md")) {
            console.log(possible_readme_paths[i]);
            if(!possible_readme_paths[i].includes("./")){
              possible_readme_paths[i] = "./" + possible_readme_paths[i];
            }
            console.log(props.currentbreadcrumb);
            if(props.currentbreadcrumb != "./"){
              var urltosend = props.currentbreadcrumb + "README.md";
              return (
                <MarkdownReadme url={urltosend} currentdir={props.currentdirectory}/>
              );
            }else{
              return (
                <MarkdownReadme url={possible_readme_paths[i]} currentdir={props.currentdirectory}/>
              );
            }
        }
        }
        return(<></>);
    }

    function find_path_in_data(id) {
        //loop over the data array
        for (let i = 0; i < dataFilePaths.length; i++) {
          //if the path contains the id then return the path
          if (dataFilePaths[i]["path"].includes(id)) {
            if(!dataFilePaths[i]["path"].includes("./")){
              dataFilePaths[i]["path"] = "./" + dataFilePaths[i]["path"];
            }
            return dataFilePaths[i]["path"];
          }
        }
      }

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
                //var path = find_path_in_data(file_id);
                var path = props.currentbreadcrumb + file_id;
                console.log(path);
                var folder_file = path.split("/")[path.split("/").length - 2];
                var mimetype = get_file_type(file_id);
                var to_give_file_id = check_name_file_display(file_id);
                var downloadbutton = <DownloadButton file_id={to_give_file_id} path={path}/>;
                return(  
                  <>
                    <span id='downloadbuttontab'>{downloadbutton}</span>
                    <Tabs  id="uncontrolled-tab-example" className="mb-3" defaultActiveKey="data">
                      <Tab eventKey="name" title="" disabled>
                      </Tab>
                      <Tab eventKey="data" title="Content" className='datatab'>
                        <div class="container">
                          <div class="preview_section"><PreviewFile file_mimetype={mimetype} file_url={path}/>  </div>
                        </div>
                      </Tab>
                      <Tab eventKey="metadata" title="Annotation">
                        {metadata}
                      </Tab>
                    </Tabs>
                  </>
                )
            }
        }
    }

  //child function that return a button for downloading a file
  function DownloadButton(props) {
    var path = props.path;
    var file_id = props.file_id;
    return(<a href={path} target="_blank" download>{file_id} <AiOutlineCloudDownload></AiOutlineCloudDownload></a>)
  }


    //child component to display metadata
  function Metadata(props) {
    //if props.metadata.length is greater than 0 then display the metadata
    if (props.metadata.length > 0) {
    return (
      <div className="metadata">
        <table className='table-center'>
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


    //if selectedfile isn't '' then display the file else display the readme of the current folder
    if (selectedfile != '') {
        return(
            <>
                <div className="file-panel">
                    <div className="file-panel-title">
                        <FileOverview file_id = {selectedfile} currentbreadcrumb={currentbreadcrumb}/>
                    </div>
                </div>
            </>
        )
    }else{
        return(
            <>
                <div className="file-panel">
                    <div className="file-panel-title">
                        <ReadMe dataFilePaths={dataFilePaths} currentdirectory={currentdirectory} currentbreadcrumb={currentbreadcrumb}></ReadMe>
                    </div>
                </div>
            </>
        )
    }
}

export default FilePanel;