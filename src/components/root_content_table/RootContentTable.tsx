//this file will contain the component that will be used to display the root content table
export default function RootContentTable(props: any) {
    const rocrate = props.rocrate;
    const loading = props.loading;
    const hash = props.hash;
    
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
                        if (item["@id"] == "./" || (item["@id"].includes("http") && item["@type"] == "File")) {
                            return (
                                <tr>
                                    <td className="clickable-secondary" onClick={() => setHashState(item["@id"])}>{item["@id"]}</td>
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