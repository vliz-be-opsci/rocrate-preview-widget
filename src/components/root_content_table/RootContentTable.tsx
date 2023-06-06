//this file will contain the component that will be used to display the root content table
import { AiFillFolder } from "react-icons/ai";
import { FaGlobe } from "react-icons/fa";
export default function RootContentTable(props: any) {
    const rocrate = props.rocrate;
    const loading = props.loading;
    const hash = props.hash;

    //reorde rocrate so that the ./ is the first element
    if (rocrate["@graph"]) {
        let index = rocrate["@graph"].findIndex((item: any) => item["@id"] == "./");
        let item = rocrate["@graph"][index];
        rocrate["@graph"].splice(index, 1);
        rocrate["@graph"].unshift(item);
    }
    
    //function that will set the hash state
    function setHashState(hash: string) {
        window.location.hash = hash;
    }

    return (
        //if hash is empty show the table 
        hash == "" ?
        <div className="rocrate_content">
        {
            //if the data is empty show a message
            loading ? <></> :
            //make table that loops over the @graph array and shows the @id and @type
            <table>
                <tr>
                    <th>Id</th>
                    <th>Type</th>
                </tr>
                {
                    rocrate["@graph"].map((item: any) => {
                        //only show item["@id"] = ./ or if the @id is a url that has @type File
                        if (item["@id"] == "./") {
                            return (
                                <tr>
                                    <td className="clickable-secondary clickable" onClick={() => setHashState(item["@id"])}><AiFillFolder/> {item["@id"]}</td>
                                    <td>{item["@type"]}</td>
                                </tr>
                            )
                        }
                        if  (item["@id"].includes("http")) {
                            return(
                                <tr>
                                    <td className="clickable-secondary clickable" onClick={() => setHashState(item["@id"])}><FaGlobe/> {item["@id"]}</td>
                                    <td>{item["@type"]}</td>
                                </tr>
                            )
                        }
                    })
                }
            </table>
        }
        </div>
    :
        <></>
    );
}