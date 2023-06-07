// this file will contain the component that will be used to display the file content
import { tryExtractWindowQueryParam } from "../../utils/hash_handler";

export default function FileMetadataTable(props: any) {
    const rocrate = props.rocrate;
    const hash = props.hash;
    const loading = props.loading;

    return (
        loading ?
        <></>
        :
        hash ?
        tryExtractWindowQueryParam(window.location.search) == "metadata" ?
        rocrate["@graph"].map((item: any) => {
            if (item["@id"] == hash.replace("#", "")) {
                if (item["@type"] == "File") {
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
                                                            return (
                                                                <li className="secondary-color">
                                                                    <a className="clickable" href={"#"+value["@id"]}>{value["@id"]}</a>
                                                                </li>
                                                            )
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
                if (item["@id"].includes("http") || item["@id"].includes("_:")) {
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
                                        //check if item[key] is an array of objects
                                        //loop over the array and give back the @ids as a list of hrefs #+hash+/+@id
                                        return (
                                            <tr>
                                                <td>{key}</td>
                                                <td>
                                                    <ul>
                                                        {item[key].map((value: any) => {
                                                            if (typeof value == "object") {
                                                                return (
                                                                    <li className="secondary-color">
                                                                        <a className="clickable" href={"#"+value["@id"]}>{value["@id"]}</a>
                                                                    </li>
                                                                )
                                                            }else{
                                                                return (
                                                                    <li className="secondary-color">
                                                                        <a className="clickable" href={"#"+value}>{value}</a>
                                                                    </li>
                                                                )
                                                            }
                                                        })}
                                                    </ul>
                                                </td>
                                            </tr>
                                        )
                                    }else {
                                        //get the @id of the object and return it as a href
                                        return (
                                            <tr>
                                                <td>{key}</td>
                                                <td>
                                                    <a className="clickable" href={"#"+item[key]["@id"]}>{item[key]["@id"]}</a>
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
            }
        })
        :
        <></>
        :
        <></>
    )
}

