//this file will return the folder contents of the folder that is currently selected
import {  AiFillFolder, AiFillFileText } from "react-icons/ai";

//make function here that takes in item and returns the table
function Table(item: any) {
    return (
        <table>
            <tr>
                <th>Attribute</th>
                <th>Value</th>
            </tr>
            {
            Object.keys(item).map((key: any) => {
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
                                                            <a className="clickable" href={"#"+value["@id"]}><AiFillFolder/> {value["@id"]}</a>
                                                        </li>
                                                    )
                                                }else{
                                                    return (
                                                        <li className="secondary-color">
                                                            <a className="clickable" href={"#"+value["@id"]}><AiFillFileText/> {value["@id"]}</a>
                                                        </li>
                                                    )
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
                            return Table(item);
                        }
                    }
                }
                if (item["@type"] == "Dataset") {
                    return Table(item);
                }
            }
        })
        :
        <></>
    );
}