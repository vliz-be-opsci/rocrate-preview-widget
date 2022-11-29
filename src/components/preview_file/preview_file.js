//this file will be the base for the preview of the file
// it will determine whether or not the currentselectedobject is a file or a folder and will display the appropriate component
import  {AiFillInfoCircle}  from  "react-icons/ai";
import {BiAnchor}  from  "react-icons/bi";
import PreviewSelectorFile from "./preview_selector/preview_selector";
const PreviewFile = (props) => {

    const currentobjectselected = props.currentobjectselected;
    const rocrateinfo = props.rocrateinfo;
    const setCurrentObjectSelected = props.setCurrentObjectSelected;
    const file_name = props.file_name;
    const file_type = props.file_type;
    console.log(currentobjectselected);


    //function here that will be used to scroll to a specific element on the page
    const scrollToElement = (element) => {
        console.log(element);
        let tofind = element;
        //set hash to the element id
        window.location.hash = tofind;
        //set current object to the element id
        //delete the # from the element id
        let currentobject = tofind.replace("#", "");
        setCurrentObjectSelected(currentobject);
    }

    //function that will return a url that will be used to get the annotation
    const getAnnotationUrl = (id) => {
        let url = "";
        if (id.includes("http")) {
            url = id;
        } else {
            url = "https://schema.org/" + id;
        }
        return url;
    }

    let annotations = rocrateinfo["@graph"].filter((item) => item["@id"] === currentobjectselected)[0];
    console.log(annotations);

    //check if the current object selected is not undefined or the currentobect length is not 0 or the currentobject is not an empty string
    if (currentobjectselected !== undefined && currentobjectselected !== null && currentobjectselected.length !== 0 && currentobjectselected !== "") {
        //check if the file_name is not undefined or the file_name length is not 0 or the file_name is not an empty string
        if (file_name !== undefined && file_name !== null && file_name.length !== 0 && file_name !== "" && annotations["@type"] === "File") {
            return (
                <div className="File-content-panel Preview display-block">
                    <PreviewSelectorFile file_mimetype={file_type} file_url={currentobjectselected} />
                </div>
            )
        }
        return (
            <div className="File-content-panel Preview display-block">
                <table id={"#"+annotations}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: '25%', maxWidth: '30%' , textAlign: 'left'}}>Annotation</th>
                            <th style={{ textAlign: 'left'}}>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(annotations).map((key) => {
                            let annotation = annotations;
                            
                            //check if the annotaion[key] is in the all_ids list
                            //check if the annotation[key] is an object
                            if (typeof annotation[key] === "object") {
                                console.log(annotation[key]);
                                //check if the annotation[key] has an id
                                if (annotation[key].hasOwnProperty("@id")) {
                                    console.log(annotation[key]);
                                    //check if the annotation[key]["id"] is a key in rocrateinfo
                                    //if it is in the all_ids list then replace the annotation[key] with the annotation[key]["id"]
                                    return(
                                        <tr key={key}>
                                            <td><a href={getAnnotationUrl(key)} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {key}</td>
                                            <td><a className="anchortag" onClick={(e)=> scrollToElement(annotation[key]["@id"])}><BiAnchor/>{annotation[key]["@id"]}</a></td>
                                        </tr>
                                    )
                                }
                            }
                            if(Array.isArray(annotation[key])){
                                //map over the array and check if the items in the array are objects
                                //make variable that will store all the list items
                                let listitems = [];
                                annotation[key].map((item) => {
                                    if(typeof item === "object"){
                                        //check if the item has an id
                                        console.log(item);
                                        if(item.hasOwnProperty("@id")){
                                            //check if the item["id"] is in the all_ids list
                                            listitems.push(<li key={item["@id"]}><a className="anchortag" onClick={(e)=> scrollToElement(item["@id"])}><BiAnchor/>{item["@id"]}</a></li>);
                                        }
                                    }
                                    else{
                                        listitems.push(<li key={item}>{item}</li>);
                                    }
                                })
                                return (
                                    <tr key={key}>
                                        <td><a href={getAnnotationUrl(key)} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {key}</td>
                                        <td>
                                            <ul>
                                                {listitems}
                                            </ul>
                                        </td>
                                    </tr>
                                )
                            }
                            if(typeof annotation[key] === "string"){
                            return (
                                <tr key={key}>
                                    <td><a href={getAnnotationUrl(key)} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {key}</td>
                                    <td>{annotation[key]}</td>
                                </tr>
                            )
                            }
                        })}
                    </tbody>
                </table>
            </div>
        )
        
    }

    return (
        <div className="File-content-panel Preview display-block">
            <p>No object currently selected</p>
            <p>Please selected an object from the list below to start exploring the rocrate</p>
            <table>
                <thead>
                    <tr>
                        <th style={{ minWidth: '25%', maxWidth: '30%' , textAlign: 'left'}}>type object</th>
                        <th style={{ textAlign: 'left'}}>name object</th>
                    </tr>
                </thead>
                <tbody>
                    {rocrateinfo["@graph"].map((item, index) => {
                        return (
                            <tr key={index} onClick={() => setCurrentObjectSelected(item["@id"])} className="basetablerow">
                                <td><a href={getAnnotationUrl(item["@type"])} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {item["@type"]}</td>
                                <td>{item["@id"]}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default PreviewFile;