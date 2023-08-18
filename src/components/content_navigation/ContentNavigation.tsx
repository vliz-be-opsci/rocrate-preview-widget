//this component will give back breadcrumb navigation of rocrate
import { Breadcrumb } from "react-bootstrap";
import { AiFillHome, AiFillFolder, AiOutlineNodeIndex, AiFillFile} from "react-icons/ai";
import {FaGlobe} from "react-icons/fa";
import { checkIfValueIsEqual } from "../../utils/graph_utils";

export default function ContentNavigation(props: any) {
    const loading = props.loading;
    const hash = props.hash;
    const rocrate = props.rocrate;
    console.log(hash);
    let hash_array = hash.split("/");
    //remove the # from the first element of the array
    hash_array[0] = hash_array[0].replace("#", "");
    const hash_array_length = hash_array.length;
    //function here that will set the uri hash to #
    const setHash = (hash: string) => {
        window.location.hash = hash;
    }

    //function to check is the hash is a url or a filepath
    const isUrl = (hash: string) => {
        if (hash.includes("http://") || hash.includes("https://")) {
            return true;
        }
        else {
            return false;
        }
    }
    console.log(hash);
    console.log(isUrl(hash));

    //function to check if hash is a blank node _:
    const isBlankNode = (hash: string) => {
        if (hash.includes("_:")) {
            return true;
        }
        else {
            return false;
        }
    }


    let hash_url_array = [];
    let split_hash = "";
    //if hash contains http:// or https:// then split on http:// or https://
    if (isUrl(hash)) {
        if (hash.includes("http://")) {
            split_hash = "http://";
            hash_url_array = hash.split("http://");
            let uri_hash_part = hash_url_array[1];
            hash_array = hash_url_array[0].split("/");
            hash_array.pop();
            let topush_uri = "http://" + uri_hash_part
            hash_array.push(topush_uri);
            hash_array[0] = hash_array[0].replace("#", "");
        }
        else if (hash.includes("https://")) {
            split_hash = "https://";
            hash_url_array = hash.split("https://");
            hash_array = hash_url_array[0].split("/");
            let uri_hash_part = hash_url_array[1];
            hash_array = hash_url_array[0].split("/");
            hash_array.pop();
            let topush_uri = "https://" + uri_hash_part
            hash_array.push(topush_uri);
            hash_array[0] = hash_array[0].replace("#", "");
        }
    }
    console.log(hash_array);

    //function to redirect to url in new tab
    const redirect = (url: string) => {
        window.open(url, "_blank");
    }

    return (
        loading ? 
        <></> 
        :
        hash ? 
        <Breadcrumb>
            <Breadcrumb.Item onClick={()=> setHash("#")}><AiFillHome className="accent-color"/></Breadcrumb.Item>
                {
                    //first check if hash is resource_uris or metadata_nodes
                    hash.includes("resource_uris") ?
                    <Breadcrumb.Item active className="accent-color"><FaGlobe/></Breadcrumb.Item>
                    :
                    hash.includes("metadata_nodes") ?
                    <Breadcrumb.Item active className="accent-color"><AiOutlineNodeIndex/></Breadcrumb.Item>
                    
                    :
                    isBlankNode(hash) ?
                    <>
                    <Breadcrumb.Item className="accent-color" onClick={() => setHash("#metadata_nodes")}><AiOutlineNodeIndex/> </Breadcrumb.Item> 
                    <Breadcrumb.Item active className="accent-color"> {hash.split("#")[1]}</Breadcrumb.Item> 
                    </>
                    :
                    hash_array.map((item: any, index: number) => {
                        console.log(item);
                        if (index == 0) {
                            return (
                                <Breadcrumb.Item className="accent-color" onClick={() => setHash("#./")}><AiFillFolder/></Breadcrumb.Item>
                            )
                        }
    
                        if (index == hash_array.length -1 || item.length == 0) {
                            /*more logic here to determine of the last part if a fodler, file or external uri*/ 
                            //check if the last part of the hash is a file or a folder
                            let last_part = hash_array[hash_array.length -1];
                            if(isUrl(last_part)){
                                return (
                                    <Breadcrumb.Item active className="accent-color"><FaGlobe/> {last_part}</Breadcrumb.Item>
                                )
                            }
                            /*check if hte type of the hash is a file*/
                            let tosearch = hash.replace("#", "")
                            let index = rocrate["@graph"].findIndex((item: any) => item["@id"] == tosearch);
                            let item_rocrate = rocrate["@graph"][index];
                            if (item_rocrate["@type"] == "File") {
                                return (
                                    <Breadcrumb.Item active className="accent-color"><AiFillFile/>{last_part}</Breadcrumb.Item>
                                )
                            }
                            return (
                                <Breadcrumb.Item active className="accent-color">{item}</Breadcrumb.Item>
                            )
                        }
                        else {
                            return (
                                <Breadcrumb.Item href={"#" + hash_array.slice(0, index + 1).join("/") + "/"} className="accent-color">{item}</Breadcrumb.Item>
                            )
                        }
                    })
                }
        </Breadcrumb>
        : 
        <></>
    )
}