//this file will contain the component that will be used to display the root content table metadata
export default function RocrateMetadataTable(props: any) {
    const loading = props.loading;
    const data = props.data;

    return (
        //if the data is empty show a message
        loading ? <></> :
        //else loop over the data and show it
        <>
        <h4>Core RO-Crate Metadata</h4>
        <table>
            <tr>
                <th>Attribute</th>
                <th>Value</th>
            </tr>
            {
                Object.keys(data).map((key) => {
                    let key_to_show = key.replace("rocrate_", "");

                    //if data[key] is None then give tr class error_row
                    if (data[key] == "None") {
                        return (
                            <tr className="error_row">
                                <td><b>{key_to_show}</b></td>
                                <td>{data[key]}</td>
                            </tr>
                        )
                    }
                    //else give tr class normal_row
                    return (
                        <tr>
                            <td>{key_to_show}</td>
                            <td>{data[key]}</td>
                        </tr>
                    )
                })
            }
        </table>
        </>
    )
}

