//this file will contain the externalfiletable component
import { checkIfValueIsEqual, getLabelValue } from "../../utils/graph_utils";
import {  AiFillFolder, AiFillFileText, AiOutlineNodeIndex } from "react-icons/ai";
import {FaGlobe} from "react-icons/fa";



//function here to check if given string is a uri or not
function isUri(str: string) {
    return str.includes("http://") || str.includes("https://");
}

export default function NodesTable(props: any) {
    const rocrate = props.rocrate;
    const loading = props.loading;
    const hash = props.hash;
    
    //function that will set the hash state
    function setHashState(hash: string) {
        window.location.hash = hash;
    }

    return (
        <div className="rocrate_content">
            {
                loading ?
                <></>
                :
                hash ?
                <div className="rocrate_metadata_table">
                <table>
                <thead>
                    <tr>
                        <th>URI</th>
                        <th>Type</th>
                        <th>mentioned in</th>
                    </tr>
                </thead>
                <tbody>
                {
                rocrate["@graph"].map((item: any) => {
                    if (checkIfValueIsEqual(item["@type"], "File") == false && checkIfValueIsEqual(item["@type"],"Dataset") == false) {

                        //make an array of all the files that are mentioned in the current file
                        let mentionedInArray: any[] = [];
                        for (let i in rocrate["@graph"]) {
                            let item2 = rocrate["@graph"][i];
                            if (item2["mentions"]) {
                                for (let j in item2["mentions"]) {
                                    if (item2["mentions"][j]["@id"] == item["@id"]) {
                                        mentionedInArray.push(item2);
                                    }
                                }
                            }
                        }
                        item["mentionedIn"] = mentionedInArray;

                        return (
                            <tr>
                                <td className="clickable-secondary clickable" onClick={() => setHashState(item["@id"])}><AiOutlineNodeIndex/> {getLabelValue(item)}</td>
                                <td>{item["@type"]}</td>
                                <td>
                                    {
                                        item["mentionedIn"] ?
                                        item["mentionedIn"].map((mentionedInItem: any) => {
                                            if(mentionedInItem["@id"] == "./"){
                                                return (
                                                    <div className="clickable-secondary clickable" onClick={() => setHashState(mentionedInItem["@id"])}><AiFillFolder/> {getLabelValue(mentionedInItem)}</div>
                                                )
                                            }
                                            //check in the item @id if it is a uri
                                            if(isUri(mentionedInItem["@id"])){
                                                return (
                                                    <div className="clickable-secondary clickable" onClick={() => setHashState(mentionedInItem["@id"])}><FaGlobe/> {getLabelValue(mentionedInItem)}</div>
                                                )
                                            }
                                            if(mentionedInItem["@type"] == "File"){
                                                return (
                                                    <div className="clickable-secondary clickable" onClick={() => setHashState(mentionedInItem["@id"])}><AiFillFileText/> {getLabelValue(mentionedInItem)}</div>
                                                )
                                            }
                                            if(mentionedInItem["@type"] == "Dataset"){
                                                return (
                                                    <div className="clickable-secondary clickable" onClick={() => setHashState(mentionedInItem["@id"])}><AiFillFolder/> {getLabelValue(mentionedInItem)}</div>
                                                )
                                            }
                                            return (
                                                <div className="clickable-secondary clickable" onClick={() => setHashState(mentionedInItem["@id"])}><AiOutlineNodeIndex/> {getLabelValue(mentionedInItem)}</div>
                                            )
                                        }
                                        )
                                        :
                                        <></>
                                    }
                                </td>
                            </tr>
                        ) 
                    }
                })
                }
                 </tbody>
                </table>
                </div>
                :
                <></>
            }
        </div>
    )
}