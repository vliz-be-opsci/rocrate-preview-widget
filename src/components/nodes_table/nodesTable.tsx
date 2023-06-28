//this file will contain the externalfiletable component
import { AiOutlineNodeIndex } from "react-icons/ai";

export default function NodesTable(props: any) {
    const rocrate = props.rocrate;
    const loading = props.loading;
    const hash = props.hash;
    
    //function that will set the hash state
    function setHashState(hash: string) {
        window.location.hash = hash;
    }

    const isBlankNode = (str: any) => {
        if (str.includes("_:")) {
            return true;
        } else {
            return false;
        }
    }

    const isUrl = (str: any) => {
        if (str.includes("http://") || str.includes("https://")) {
            return true;
        } else {
            return false;
        }
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
                    </tr>
                </thead>
                <tbody>
                {
                rocrate["@graph"].map((item: any) => {
                    if (item["@type"] != "File" && item["@type"] != "Dataset" && item["@id"] != "./ro-crate-metadata.json") {
                        return (
                            <tr>
                                <td className="clickable-secondary clickable" onClick={() => setHashState(item["@id"])}><AiOutlineNodeIndex/> {item["@id"]}</td>
                                <td>{item["@type"]}</td>
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