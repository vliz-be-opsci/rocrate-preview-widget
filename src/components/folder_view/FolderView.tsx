//this file will return the folder contents of the folder that is currently selected
import {  AiFillFolder, AiFillFileText } from "react-icons/ai";
import { checkIfValueIsEqual, getLabelValue, getItemFromGraph } from "../../utils/graph_utils";
import {FaGlobe} from "react-icons/fa";

//function that will check if a given string is a uri or not
function isUri(str: string) {
    return str.includes("http://") || str.includes("https://");
}


//make function here that takes in item and returns the table
function Table(item: any, rocrate: any) {
    return (
        <table>
            <tr>
                <th>Attribute</th>
                <th>Value</th>
            </tr>
            {
            Object.keys(item).map((key: any) => {

                //if key == @id then return const @id = item[key]
                const id = item["@id"];

                //if the value is an object then reutrn the type of the object
                if (typeof item[key] == "object") {
                    //if the object is an array then console log the array
                    if (Array.isArray(item[key])) {
                        console.log(item[key]);

                        //loop over the array and give back the @ids as a list of hrefs #+hash+/+@id
                        return (
                            <tr>
                                <td>{key}</td>
                                <td>
                                    <ul>
                                        {item[key].map((value: any) => {
                                            //first check if the value is an object
                                            if (typeof value == "object") {
                                                if (value["@id"].slice(-1) == "/" && value["@id"].slice(0, 1) == ".") {
                                                    return (
                                                        <li className="secondary-color">
                                                            <a className="clickable" href={"#"+value["@id"]}><AiFillFolder/> { getLabelValue(getItemFromGraph(rocrate, value["@id"]))}</a>
                                                        </li>
                                                    )
                                                }else{
                                                    if (isUri(value["@id"])) {
                                                        return (
                                                            <li className="secondary-color">
                                                                <a className="clickable" href={"#"+id+value["@id"]}><FaGlobe/> {getLabelValue(getItemFromGraph(rocrate, value["@id"]))}</a>
                                                            </li>
                                                        )
                                                    }else{
                                                        return (
                                                            <li className="secondary-color">
                                                                <a className="clickable" href={"#"+value["@id"]}><AiFillFileText/> {getLabelValue(getItemFromGraph(rocrate, value["@id"]))}</a>
                                                            </li>
                                                        )
                                                    }
                                                }
                                            }else{
                                                return (
                                                    <li className="secondary-color">
                                                        {value}
                                                    </li>
                                                )
                                            }
                                        })}
                                    </ul>
                                </td>
                            </tr>
                        )
                    }
                }else{
                    return (
                        <tr>
                            <td>{key}</td>
                            <td>{item[key]}</td>
                        </tr>
                    )
                }
            })
            }
            
        </table>
    )
}

export default function FolderView(props: any) {
    const loading = props.loading;
    const rocrate = props.rocrate;
    //console.log(rocrate);
    const hash = props.hash;
    return (
        loading ?
        <></>
        :
        hash ?
        rocrate["@graph"].map((item: any) => {
            if (item["@id"] == hash.replace("#", "")) {
                //check if @type is of type array and if so loop over it
                if (Array.isArray(item["@type"])) {
                    for (let i = 0; i < item["@type"].length; i++) {
                        console.log(item["@type"][i]);
                        if (item["@type"][i] == "Dataset") {
                            return Table(item, rocrate["@graph"]);
                        }
                    }
                }
                if (item["@type"] == "Dataset") {
                    return Table(item, rocrate["@graph"]);
                }
            }
        })
        :
        <></>
    );
}