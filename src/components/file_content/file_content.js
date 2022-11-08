//this file will contain the file content component that will displat the content of a file
import { get_file_type } from "../../services/utils/filefunctions";

const FileContentDisplay = (props) => {
    //get the file content
    const currentobjectselected = props.currentobjectselected;
    const rocrateinfo = props.rocrateinfo;
    console.log(rocrateinfo["@graph"]);
    //get the annotations for the current object selected
    const annotations = rocrateinfo["@graph"].filter((item) => item["@id"] === currentobjectselected);
    console.log(annotations[0]);

    const file_name = currentobjectselected.split("/").pop();
    const file_type = get_file_type(file_name);
    console.log(file_type);

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

    return(
        <>
            <h3 onClick={(e)=> {changeClassname()}} className="titlebar-filecontent titlebar-active">{file_name} info</h3>
            <div className="file-content fade-in">
                <p>File type: {file_type}</p>
                <p>File name: {file_name}</p>
                <a href={currentobjectselected} target="_blank" download>{currentobjectselected.split("/").pop()}</a>
            </div>
        </>
    )
}

export default FileContentDisplay;