//3th party imports here
import React, {useEffect,useState} from 'react';
import {AiFillFolderOpen, AiOutlineLink} from 'react-icons/ai';
import {BsFillFileEarmarkBreakFill} from 'react-icons/bs';
import {VscRootFolder} from 'react-icons/vsc';
import {IoMdArrowDropleft} from 'react-icons/io';
import {RiFolderReceivedFill} from 'react-icons/ri';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
//component imports here
import FileIconElement from '../file_icon_element/file_icon_element';

//import util functions here
import {check_name_file_display } from '../../utils/rocrate_metadata_functions';

//css import here
import './sidebar.css';


function Sidebar(props) {
    //constants
    const metadata = props.metadata;
    const dataFiles = props.dataFiles;
    const currentdirectory = props.currentdirectory;
    const lastdirectory = props.lastdirectory;
    const setLastDirectory = props.setLastDirectory;
    const setCurrentDirectory = props.setCurrentDirectory;
    const dataFilePaths = props.dataFilePaths;
    const setSelectedFile = props.setSelectedFile;
    const setCurrentBreadcrumb = props.setCurrentBreadcrumb;
    const currentbreadcrumb = props.currentbreadcrumb;
    const lastbreadcrumb = props.lastbreadcrumb;
    const setLastBreadcrumb = props.setLastBreadcrumb;
    const setHash = props.setHash;

    //perform functions here
    //child function that will determine if there is a go back button and a ./ button
    function GoBack(props) {
        var unique = props.dir_paths;
        console.log(unique);
        //if lastdirectory == "" then there is no go back button
        if(currentbreadcrumb == "./") {
            return (<></>);
        }
        // split the current breadcrumb by / and keep everything but the second and last and then join them with /
        var split_current_breadcrumb = currentbreadcrumb.split('/');
        var joined_current_breadcrumb = split_current_breadcrumb.slice(0, split_current_breadcrumb.length - 2).join('/')+'/';
        if(joined_current_breadcrumb == "./") {
            return (<></>);
        }

        return(
            <button className="folderbutton navbarbutton" onClick={() => {
                //set the current directory to the root directory
                setCurrentDirectory(joined_current_breadcrumb);
                //set the last directory to the current directory
                setLastDirectory(currentdirectory);
                setSelectedFile("");
                setLastBreadcrumb(currentbreadcrumb);
                setCurrentBreadcrumb(joined_current_breadcrumb);
                setHash(joined_current_breadcrumb);
            }}><RiFolderReceivedFill></RiFolderReceivedFill>: /(parent)</button>
        );
    }

    function Currentnavigation() {
        var unique_paths = [];
        //loop over the metadata grapths and get all the dirs of the currentdirectry
        console.log(String(currentdirectory));
        let new_currentdirectory = String(currentdirectory);
        //check if currentdirectory starts with "./" => if true then remove the "./"
        if(currentdirectory.startsWith("./")) {
            let new_currentdirectory = currentdirectory.substring(2);
            console.log(new_currentdirectory);
            // if length new_currentdirectory is 0 then set new_currentdirectory to currentdirectory
            if(new_currentdirectory.length == 0) {
                new_currentdirectory = currentdirectory;
            }
        }

        console.log(metadata)
        for (let i = 0; i < metadata["@graph"].length; i++) {
            //if the current directory is the same as the current directory then add it to the unique_paths array
            if (metadata["@graph"][i]["@id"] == new_currentdirectory) {
                //look into the hasparts and get all the dirs
                for (let j = 0; j < metadata["@graph"][i]["hasPart"].length; j++) {
                    console.log(metadata["@graph"][i]["hasPart"][j]);
                    //if last part is / then add to the unique_paths array
                    if (metadata["@graph"][i]["hasPart"][j]["@id"].split("/")[metadata["@graph"][i]["hasPart"][j]["@id"].split("/").length - 1] === "") {
                        unique_paths.push(metadata["@graph"][i]["hasPart"][j]["@id"]);
                    }
                }
            }
        }

        //return a list of all the unique paths
        console.log(currentbreadcrumb);
        return (
            <div className="currentnavigation">
                <button className="folderbutton navbarbutton" onClick={() => {
                    //set the current directory to the root directory
                    setCurrentDirectory("./");
                    //set the last directory to the current directory
                    setLastDirectory(currentdirectory);
                    setSelectedFile("");
                    setLastBreadcrumb(currentbreadcrumb);
                    setCurrentBreadcrumb('./');
                    setHash('./');
                }}><VscRootFolder></VscRootFolder>: /(root)</button>
                <GoBack dir_paths = {unique_paths} currentbreadcrumb={currentbreadcrumb} setCurrentBreadcrumb={setCurrentBreadcrumb}/>
                {unique_paths.map((unique_path) => (
                    <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                        <Tooltip id="button-tooltip" {...props}>
                        {unique_path}
                        </Tooltip>
                    }
                    >
                        <button className="folderbutton navbarbutton" onClick={() => {setLastBreadcrumb(currentbreadcrumb);setCurrentBreadcrumb(unique_path);setHash(unique_path); setCurrentDirectory(unique_path);setSelectedFile("");}}><AiFillFolderOpen></AiFillFolderOpen>: {unique_path}</button>
                    </OverlayTrigger>
                ))}
                
            </div>
        );
    }
    //if loading is true return loading
    return(
        <>
            <div class="containersidebar blue">
                <div class="navbar_space">
                    <div className="sidebar">
                            <Currentnavigation/>
                            {dataFilePaths.map((item, index) => {
                                var folder_file = item["path"].split("/")[item["path"].split("/").length - 2];
                                var file_id = item["path"].split("/")[item["path"].split("/").length - 1];
                                console.log(folder_file);
                                let new_currentdirectory = String(currentdirectory);
                                //if currentdirecttory starts with "./" then remove the "./"
                                if(currentdirectory.startsWith("./") && currentdirectory.length > 2) {
                                    new_currentdirectory = currentdirectory.substring(2);
                                }else{
                                    new_currentdirectory = currentdirectory;
                                }
                                console.log(new_currentdirectory.split("/")[0]);
                                if (folder_file == new_currentdirectory.split("/")[0]){
                                    var toreturnfile_id = check_name_file_display(file_id);
                                    return(
                                        <>
                                        <FileIconElement className="filebutton navbarbutton" setHash={setHash} currentbreadcrumb={currentbreadcrumb} setSelectedFile={setSelectedFile} file_id={file_id} toreturnfile_id={toreturnfile_id}></FileIconElement>
                                        </>
                                        
                                    )
                                }
                            })}
                            <button className='resourcebutton navbarbutton'><AiOutlineLink></AiOutlineLink>: resources here</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar;