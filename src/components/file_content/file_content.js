//this file will contain the file content component that will displat the content of a file
import { get_file_type } from "../../services/utils/filefunctions";
import { useEffect } from "react";
import AnnotationTable from "../annotation_table/annotation_table";

const FileContentDisplay = (props) => {
    //get the file content
    const currentobjectselected = props.currentobjectselected;
    const rocrateinfo = props.rocrateinfo;
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
        const buttonselected = event.target;
        const buttonselectedclasses = buttonselected.classList;
        //get the inner html of the button 
        const buttonselectedvalue = buttonselected.innerHTML;
        console.log(buttonselectedvalue);
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
                    <button className="navbarbutton-file-content" onClick={(e) => {handleSelectButton(e)}}>Annotations</button>
                    <button className="navbarbutton-file-content selected" onClick={(e) => {handleSelectButton(e)}}>Preview</button>
                    <button className="navbarbutton-file-content" onClick={(e) => {handleSelectButton(e)}}>Download</button>
                </div>
                <AnnotationTable annotations={annotations[0]} rocrateinfo={rocrateinfo}/>
                <p>File type: {file_type}</p>
                <p>File name: {file_name}</p>
                <a href={currentobjectselected} target="_blank" download>{currentobjectselected.split("/").pop()}</a>
            </div>
        </>
    )
}

export default FileContentDisplay;