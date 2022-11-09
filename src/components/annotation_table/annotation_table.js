//this component will display the annotations in a table wit a link to the respective schema.org page

const AnnotationTable = (props) => {
    //get the annotations for the current object selected
    const annotations = props.annotations;
    const rocrateinfo = props.rocrateinfo;
    console.log(annotations);
    let def_annotations = {};

    //reciproce function here that will loop over an object and will add the key and values to a dict where the values of the object are not an object 
    //if the value is an object, then it will call the function again and will add the key and values to the dict
    //in the end it will add all dict that were made to a list and will return the list
    //this function will be used to get the annotations for the current object selected
    let all_annotations = [];

    const secondcheck = (objectsecondcheck, annotations,toconcatdict,key) => {
        let tocheckobject = objectsecondcheck;
        console.log(tocheckobject);
        if (tocheckobject.hasOwnProperty("@id")) {
            if (typeof tocheckobject["@id"] === 'string') {
                const checkobject = rocrateinfo["@graph"].filter((item) => item["@id"] === tocheckobject["@id"]);
                console.log(checkobject);
                //if the checkobject is not empty then call the function again and add the key and value to the dict
                if (checkobject.length !== 0) {
                    let extradict  = getAnnotations(checkobject[0],annotations);
                    annotations = annotations.concat(extradict);
                }
                toconcatdict[key] = objectsecondcheck["@id"];
            }
        }
        //if obj[key] is an array then concat it to the dict
        if (Array.isArray(objectsecondcheck)) {
            console.log(objectsecondcheck);
            //loop over all the items in the array and check if they are objects
            for (let i = 0; i < objectsecondcheck.length; i++) {
                if (typeof objectsecondcheck[i] === 'object') {
                    if(objectsecondcheck[i].hasOwnProperty("@id")) {
                        if (typeof objectsecondcheck[i]["@id"] === 'string') {
                            const checkobject = rocrateinfo["@graph"].filter((item) => item["@id"] === objectsecondcheck[i]["@id"]);
                            console.log(checkobject);
                            //if the checkobject is not empty then call the function again and add the key and value to the dict
                            if (checkobject.length !== 0) {
                                let extradict  = getAnnotations(checkobject[0],annotations);
                                annotations = annotations.concat(extradict);
                            }
                            //toconcatdict[key] = objectsecondcheck[i]["@id"];
                            
                        }
                    }
                    //replace the objectsecondcheck[i] with the value of the @id key
                } else {
                    toconcatdict[key] = objectsecondcheck;
                }
            }
        }
    }
    const getAnnotations = (obj,annotations) => {
        let toconcatdict = {};
        console.log(obj);
        for (let key in obj) {
            console.log(key);
            if (typeof obj[key] === 'object') {
                //check first if the object has key "@id" in it , if it does then check if the value if the key is a string
                //if it is a string then check in the rocrateinfo["@graph"] if the value of the key "@id" is equal to the value of the key "@id" in the object
                //if it is equal then getAnnotations(obj[key]) and add the key and value to the dict
                secondcheck(obj[key],annotations,toconcatdict,key);
            } else {
                toconcatdict[key] = obj[key];
            }
        }
        annotations.push(toconcatdict);
        return annotations;
    }

    let annotations_list = getAnnotations(annotations,all_annotations);
    console.log(annotations_list);
    // get unique annotations
    let unique_annotations = annotations_list.filter((v,i,a)=>a.findIndex(t=>(t['@type'] === v['@type']))===i); 
    console.log(unique_annotations);

    //go over all annotations in unique_annotations and check if all the values are strings and if the value is a list then check if all the items in teh list are values
    //if the value is an object try and replace set object with the obj["id"] value
    const checkAnnotations = (annotations) => {
        let annotations_list = [];
        for (let i = 0; i < annotations.length; i++) {
            let annotation = annotations[i];
            let annotation_dict = {};
            for (let key in annotation) {
                if (typeof annotation[key] === 'object') {
                    if (annotation[key].hasOwnProperty("@id")) {
                        if (typeof annotation[key]["@id"] === 'string') {
                            annotation_dict[key] = annotation[key]["@id"];
                        }
                    }
                    if (Array.isArray(annotation[key])) {
                        let annotation_list = [];
                        for (let j = 0; j < annotation[key].length; j++) {
                            if (typeof annotation[key][j] === 'object') {
                                if (annotation[key][j].hasOwnProperty("@id")) {
                                    if (typeof annotation[key][j]["@id"] === 'string') {
                                        annotation_list.push(annotation[key][j]["@id"]);
                                    }
                                }
                            } else {
                                annotation_list.push(annotation[key][j]);
                            }
                        }
                        annotation_dict[key] = annotation_list;
                    }
                } else {
                    annotation_dict[key] = annotation[key];
                }
            }
            annotations_list.push(annotation_dict);
        }
        return annotations_list;
    }

    let annotations_list_checked = checkAnnotations(unique_annotations);
    //reverse the list so that the annotations that are closer to the object are displayed first
    annotations_list_checked.reverse();
    console.log(annotations_list_checked);



    //function here that will check if all the values in the annotation are not an array or an object, if so leave them out of the table
    const checkIfAllValuesAreNotArrayOrObject = (tocheckobject) => {
        let allValuesAreNotArrayOrObject = {}
        //loop through the annotation object and check if the value is an array or an object
        for (let key in tocheckobject) {
            console.log(typeof tocheckobject[key]);
            // if the value is not an array and not an object, then add it to the allValuesAreNotArrayOrObject object
            if (typeof tocheckobject[key] !== 'object') {
                allValuesAreNotArrayOrObject[key] = tocheckobject[key];
            }
        }
        return allValuesAreNotArrayOrObject;
    }

    try {
        def_annotations = checkIfAllValuesAreNotArrayOrObject(annotations);
        console.log(def_annotations);
    } catch (error) {
        console.log(error);
    }
    
    try {
        return (
            <div className="File-content-panel Annotations display-none">
                {annotations_list_checked.map((annotation) => {
                    //check if the annotation is not empty
                    if (Object.keys(annotation).length !== 0) {
                        //make table from annotation
                        return (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: '25%', maxWidth: '30%' , textAlign: 'left'}}>Annotation</th>
                                        <th style={{ textAlign: 'left'}}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(annotation).map((key) => {
                                        //if the annotation[key] is an array return a ul with the values of the array as li
                                        if (Array.isArray(annotation[key])) {
                                            console.log(annotation[key]);
                                            return (
                                                <tr>
                                                    <td>{key}</td>
                                                    <td>
                                                        <ul>
                                                            {annotation[key].map((value) => {
                                                                console.log(value);
                                                                return(
                                                                    <li>{value}</li>
                                                                )
                                                            })}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            )
                                        } else {
                                            return (
                                                <tr>
                                                    <td>{key}</td>
                                                    <td>{annotation[key]}</td>
                                                </tr>
                                            )
                                        }
                                    })}
                                </tbody>
                            </table>
                        )
                    }
                })}
            </div>
        )
    } catch (error) {
        return(<></>)
    }
}

export default AnnotationTable;
