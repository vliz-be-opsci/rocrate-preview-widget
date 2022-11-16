//this file will contain the file content component that will displat the content of a file
import { get_file_type } from "../../services/utils/filefunctions";
import { useEffect } from "react";
import AnnotationTable from "../annotation_table/annotation_table";
import PreviewFile from "../preview_file/preview_file";
import {SiGraphql} from "react-icons/si";
import {BsCloudDownloadFill} from "react-icons/bs";
import {MdOutlinePreview} from "react-icons/md";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const FileContentDisplay = (props) => {
    //get the file content
    const currentobjectselected = props.currentobjectselected;
    const rocrateinfo = props.rocrateinfo;
    const setCurrentObjectSelected = props.setCurrentObjectSelected;
    console.log(rocrateinfo["@graph"]);
    console.log(currentobjectselected);
    //get the annotations for the current object selected
    const annotations = rocrateinfo["@graph"].filter((item) => item["@id"] === currentobjectselected);
    console.log(annotations[0]);
    const file_name = currentobjectselected.split("/").pop();
    const file_type = get_file_type(file_name);
    console.log(file_type);
    //use effect here that changes the file name and file type based on the current object selected
    useEffect(() => {
        //get the annotations for the current object selected
        const annotations = rocrateinfo["@graph"].filter((item) => item["@id"] === currentobjectselected);
        console.log(annotations[0]);
        const file_name = currentobjectselected.split("/").pop();
        const file_type = get_file_type(file_name);
        console.log(file_type);
    }, [currentobjectselected]);


    const changeClassname = () => {
        const titlebar = document.getElementsByClassName("titlebar-filecontent");
        const filecontent = document.getElementsByClassName("file-content");
        //check if titlebar has the class titlebar-active if not then add it and delete the class titlebar-inactive, or vice versa
        if (titlebar[0].classList.contains("titlebar-active")) {
            titlebar[0].classList.remove("titlebar-active");
            titlebar[0].classList.add("titlebar-inactive");
            titlebar[0].innerHTML = `Show ${file_name} info`;
            filecontent[0].classList.remove("fade-in");
            filecontent[0].classList.add("fade-out");
        } else {
            titlebar[0].classList.remove("titlebar-inactive");
            titlebar[0].classList.add("titlebar-active");
            titlebar[0].innerHTML = `Hide  ${file_name} info`;
            filecontent[0].classList.remove("fade-out");
            filecontent[0].classList.add("fade-in");
        }
    }

    //const here that will handlesleectbutton
    const handleSelectButton = (event) => {
        //geth the classes of the button selected
        const buttonselected = event[0].target;
        const buttonselectedvalue = event[1];

        //if buttonselectedvalue is download then download the file
        if (buttonselectedvalue === "download") {
            //download the file
            const downloadlink = document.createElement("a");
            downloadlink.href = currentobjectselected;
            downloadlink.target = "_blank";
            downloadlink.download = file_name;
            downloadlink.click();
            return;
        }

        console.log(buttonselected);
        const buttonselectedclasses = buttonselected.classList;
        console.log(buttonselectedclasses);
        //get the element in the document that has buttonselectedvalue as its class
        const elementselected = document.getElementsByClassName(buttonselectedvalue);
        console.log(elementselected);
        //get all the elements in the document that have the class File-content-panel
        const filecontentpanels = document.getElementsByClassName("File-content-panel");
        //loop through the filecontentpanels and remove the class display-block and add the class display-none
        for (let i = 0; i < filecontentpanels.length; i++) {
            filecontentpanels[i].classList.remove("display-block");
            filecontentpanels[i].classList.add("display-none");
        }
        //get all the buttons with classname navbarbutton-file-content
        const buttons = document.getElementsByClassName("navbarbutton-file-content");
        //loop through the buttons and remove the class navbarbutton-file-content-active
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove("selected");
        }

        //add the class display-block to the element selected
        elementselected[0].classList.remove("display-none");
        elementselected[0].classList.add("display-block");

        //add the class navbarbutton-file-content-active to the button selected
        buttonselectedclasses.add("selected");
    }

    return(
        <>
            <h3 onClick={(e)=> {changeClassname()}} className="titlebar-filecontent titlebar-active">Hide {file_name} info</h3>
            <div className="file-content fade-in">
                <div className="buttonnavbar flex">
                    <OverlayTrigger
                        key={"overlay-annotations"}
                        placement={"bottom"}
                        overlay={
                            <Tooltip id={`tooltip-annotations`}>
                                <strong>Annotations</strong>
                            </Tooltip>
                        }
                    >
                        <button className="navbarbutton-file-content" onClick={(e) => {handleSelectButton([e,"Annotations"])}}><SiGraphql/></button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        key={"overlay-preview"}
                        placement={"bottom"}
                        overlay={
                            <Tooltip id={`tooltip-preview`}>
                                <strong>Preview</strong>
                            </Tooltip>
                        }
                    >
                        <button className="navbarbutton-file-content selected" onClick={(e) => {handleSelectButton([e,"Preview"])}}><MdOutlinePreview/></button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        key={"overlay-download"}
                        placement={"bottom"}
                        overlay={   
                            <Tooltip id={`tooltip-download`}>
                                <strong>Download</strong>
                            </Tooltip>
                        }
                    >
                    <button className="navbarbutton-file-content" onClick={(e) => {handleSelectButton([e,"download"])}}><BsCloudDownloadFill/></button>
                    </OverlayTrigger>
                </div>
                <AnnotationTable annotations={annotations[0]} rocrateinfo={rocrateinfo} setCurrentObjectSelected={setCurrentObjectSelected}/>
                <PreviewFile file_type={file_type} file_name={file_name} rocrateinfo={rocrateinfo} setCurrentObjectSelected={setCurrentObjectSelected} currentobjectselected={currentobjectselected}/>
                <br></br>
            </div>
        </>
    )
}

export default FileContentDisplay;