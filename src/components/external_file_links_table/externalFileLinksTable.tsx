//this file will contain the externalfiletable component
import { FaGlobe} from "react-icons/fa";
import { checkIfValueIsEqual } from "../../utils/graph_utils";

export default function ExternalFileLinksTable(props: any) {
    const rocrate = props.rocrate;
    const loading = props.loading;
    const hash = props.hash;
    
    //function that will set the hash state
    function setHashState(hash: string) {
        window.location.hash = hash;
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
                        </tr>
                    </thead>
                    <tbody>
                    {
                        rocrate["@graph"].map((item: any) => {
                            if (checkIfValueIsEqual(item["@type"],"File") || checkIfValueIsEqual(item["@type"],"Dataset")) {
                            if (isUrl(item["@id"])) {
                                return (
                                    <tr>
                                        <td className="clickable-secondary clickable" onClick={() => setHashState(item["@id"])}><FaGlobe/> {item["@id"]}</td>
                                    </tr>         
                                )
                            }
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