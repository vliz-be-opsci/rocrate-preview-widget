//3th party imports here
import React, {useEffect,useState} from 'react';
import {AiFillFolderOpen, AiOutlineLink} from 'react-icons/ai';
import {BsFillFileEarmarkBreakFill} from 'react-icons/bs';

//component inports here

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
        if (lastdirectory == "") {
            return(<div className="go-back">
            <button className="folderbutton navbarbutton" onClick={() => {
                //set the current directory to the root directory
                setCurrentDirectory("./");
                //set the last directory to the current directory
                setLastDirectory(currentdirectory);
                setSelectedFile("");
                setLastBreadcrumb(currentbreadcrumb);
                setCurrentBreadcrumb('./');
                setHash('./');
            }}><AiFillFolderOpen></AiFillFolderOpen>: ./</button>
        </div>);
        }
        //if current directory is "./" then there is no go back button
        else if (currentdirectory == "./") {
            return(<div className="go-back">
            <button className="folderbutton navbarbutton" onClick={() => {
                //set the current directory to the root directory
                setCurrentDirectory("./");
                //set the last directory to the current directory
                setLastDirectory(currentdirectory);
                setSelectedFile("");
                setLastBreadcrumb(currentbreadcrumb);
                setCurrentBreadcrumb('./');
                setHash('./');
            }}><AiFillFolderOpen></AiFillFolderOpen>: ./</button>
        </div>);
        }
        //if lastdirectory is not "" and current directory is not "./" then display the go back button
        else {
            //if lastdirectory == './' only return one button
            if (lastdirectory == './') {
                return(
                    <button className="folderbutton navbarbutton" onClick={() => {
                        //set the current directory to the last directory
                        setCurrentDirectory(lastdirectory);
                        //set the last directory to the current directory
                        setLastDirectory(currentdirectory);
                        setSelectedFile("");
                        setLastBreadcrumb(currentbreadcrumb);
                        setCurrentBreadcrumb('./');
                        setHash('./');
                        
                    }
                    }><AiFillFolderOpen></AiFillFolderOpen>: {lastdirectory}</button>
                )
                
            }else{
                //if lastdirectory is in the unique array then display the go back button
                if (unique.includes(lastdirectory)) {
                    return(
                        <div className="go-back">
                            <button className="folderbutton navbarbutton" onClick={() => {
                                //set the current directory to the root directory
                                setCurrentDirectory("./");
                                //set the last directory to the current directory
                                setLastDirectory(currentdirectory);
                                setSelectedFile("");
                                setLastBreadcrumb(currentbreadcrumb);
                                setCurrentBreadcrumb('./');
                                setHash('./');
                            }}><AiFillFolderOpen></AiFillFolderOpen>: ./</button>
                        </div>
                    );
                }else{
                    return(
                        <div className="go-back">
                            <button className="folderbutton navbarbutton" onClick={() => {
                                //set the current directory to the last directory
                                setCurrentDirectory(lastdirectory);
                                //set the last directory to the current directory
                                setLastDirectory(currentdirectory);
                                setSelectedFile("");
                                setLastBreadcrumb(currentbreadcrumb);
                                setCurrentBreadcrumb(lastbreadcrumb);
                                setHash(lastbreadcrumb);
                            }
                            }><AiFillFolderOpen></AiFillFolderOpen>: {lastdirectory}</button>
                            <button className="folderbutton navbarbutton" onClick={() => {
                                //set the current directory to the root directory
                                setCurrentDirectory("./");
                                //set the last directory to the current directory
                                setLastDirectory(currentdirectory);
                                setSelectedFile("");
                                setLastBreadcrumb(currentbreadcrumb);
                                setCurrentBreadcrumb('./');
                                setHash('./');
                            }}><AiFillFolderOpen></AiFillFolderOpen>: ./</button>
                        </div>
                    );
                }
            }
        }
    }

    function Currentnavigation() {
        var unique_paths = [];
        //loop over the metadata grapths and get all the dirs of the currentdirectry
        console.log(String(currentdirectory));
        console.log(metadata)
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
        console.log(currentbreadcrumb);
        return (
            <div className="currentnavigation">
                {unique_paths.map((unique_path) => (
                    <button className="folderbutton navbarbutton" onClick={() => {setLastBreadcrumb(currentbreadcrumb);setCurrentBreadcrumb(currentbreadcrumb+unique_path);setHash(currentbreadcrumb+unique_path); setCurrentDirectory(unique_path);setSelectedFile("");}}><AiFillFolderOpen></AiFillFolderOpen>: {unique_path}</button>
                ))}
                <GoBack dir_paths = {unique_paths} currentbreadcrumb={currentbreadcrumb} setCurrentBreadcrumb={setCurrentBreadcrumb}/>
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
                                if (folder_file == currentdirectory.split("/")[0]){
                                    var toreturnfile_id = check_name_file_display(file_id);
                                    return(
                                        <button className="filebutton navbarbutton" onClick={() => {setSelectedFile(file_id);setHash(currentbreadcrumb+file_id);}}><BsFillFileEarmarkBreakFill></BsFillFileEarmarkBreakFill>: {toreturnfile_id}</button>
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
/*
            <div className="sidebar blue">
                <div className="sidebar-folders blue">
                    <div className='sidebar-subtitle'>folders</div>
                    <Currentnavigation/>
                </div>
                <div className="sidebar-files blue">
                    <div className='sidebar-subtitle'>files</div>
                    {dataFilePaths.map((item, index) => {
                        var folder_file = item["path"].split("/")[item["path"].split("/").length - 2];
                        var file_id = item["path"].split("/")[item["path"].split("/").length - 1];
                        if (folder_file == currentdirectory.split("/")[0]){
                            return(
                                <button className="filebutton navbarbutton" onClick={() => {setSelectedFile(file_id)}}>{file_id}</button>
                            )
                        }
                    })}
                </div>
                <div className="sidebar-resources blue">
                    <div className='sidebar-subtitle'>Resources</div>
                    <button className='resourcebutton navbarbutton'>resources here</button>
                    
                </div>
            </div>
*/