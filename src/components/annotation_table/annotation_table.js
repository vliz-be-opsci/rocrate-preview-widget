//this component will display the annotations in a table wit a link to the respective schema.org page
import  {AiFillInfoCircle}  from  "react-icons/ai";
import {BiAnchor}  from  "react-icons/bi";

const AnnotationTable = (props) => {
    //get the annotations for the current object selected
    const annotations = props.annotations;
    const rocrateinfo = props.rocrateinfo;
    const setCurrentObjectSelected = props.setCurrentObjectSelected;
    console.log(annotations);
    //go over all annotations in unique_annotations and check if all the values are strings and if the value is a list then check if all the items in teh list are values
    //if the value is an object try and replace set object with the obj["id"] value
    //reverse the list so that the annotations that are closer to the object are displayed first

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
    
    try {
        return (
            <div className="File-content-panel Annotations display-none">
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

                                    if(key.startsWith("@")){
                                        if(key === "@id"){
                                            return (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{annotation[key]}</td>
                                                </tr>
                                            )
                                        }
                                        else if(key === "@type"){
                                            return (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td><a href={getAnnotationUrl(annotation[key])} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {annotation[key]}</td>
                                                </tr>
                                            )
                                        }
                                        else{
                                            return (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td><a className="anchortag" onClick={(e)=> scrollToElement(annotation[key]["@id"])}><BiAnchor/>{annotation[key]["@id"]}</a></td>
                                                </tr>
                                            )
                                        }
                                    }
                                    else {
                                        return (
                                            <tr key={key}>
                                                <td><a href={getAnnotationUrl(key)} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {key}</td>
                                                <td><a className="anchortag" onClick={(e)=> scrollToElement(annotation[key]["@id"])}><BiAnchor/>{annotation[key]["@id"]}</a></td>
                                            </tr>
                                        )
                                    }
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

                                //check if the key starts with @ and if its @id then don't add the annotationicon , if its @type then add an anchor and a liink to schema.org
                                if(key.startsWith("@")){
                                    if(key === "@id"){
                                        return (
                                            <tr key={key}>
                                                <td>{key}</td>
                                                <td>{annotation[key]}</td>
                                            </tr>
                                        )
                                    }
                                    else if(key === "@type"){
                                        return (
                                            <tr key={key}>
                                                <td>{key}</td>
                                                <td><a href={getAnnotationUrl(annotation[key])} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {annotation[key]}</td>
                                            </tr>
                                        )
                                    }
                                    else{
                                        return (
                                            <tr key={key}>
                                                <td>{key}</td>
                                                <td>{annotation[key]}</td>
                                            </tr>
                                        )
                                    }
                                }
                                else{
                                    return (
                                        <tr key={key}>
                                            <td><a href={getAnnotationUrl(key)} target="_blank" rel="noreferrer"><AiFillInfoCircle className="annotationinfoicon"/></a> {key}</td>
                                            <td>{annotation[key]}</td>
                                        </tr>
                                    )
                                }
                            }
                        })}
                    </tbody>
                </table>
            </div>
        )
    } catch (error) {
        return(<></>)
    }
}

export default AnnotationTable;
