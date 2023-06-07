//this component will give back breadcrumb navigation of rocrate
import { Breadcrumb } from "react-bootstrap";
import { AiFillHome, AiFillFolder, AiOutlineNodeIndex} from "react-icons/ai";
import {FaGlobe} from "react-icons/fa";

export default function ContentNavigation(props: any) {
    const loading = props.loading;
    const hash = props.hash;
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
            hash_array = hash_url_array[0].split("/");
        }
        else if (hash.includes("https://")) {
            split_hash = "https://";
            hash_url_array = hash.split("https://");
            hash_array = hash_url_array[0].split("/");
        }
    }

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
                    isUrl(hash) ?
                    hash_array.map((item: any, index: number) => {
                        let url = split_hash+hash_url_array[1];
                        if (item =="#"){
                            return (
                                <Breadcrumb.Item active className="accent-color"><FaGlobe/> {url} </Breadcrumb.Item>
                            )
                        }
                        if (index == 0) {
                            return (
                                <Breadcrumb.Item className="accent-color" onClick={() => setHash("#./")}><AiFillFolder/></Breadcrumb.Item>
                            )
                        }
                        if (index == hash_array_length -1 || item.length == 0) {
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
                    :
                    isBlankNode(hash) ?
                    <Breadcrumb.Item active className="accent-color"><AiOutlineNodeIndex/> {hash.split("#")[1]}</Breadcrumb.Item> 
                    :
                    hash_array.map((item: any, index: number) => {
                        if (index == 0) {
                            return (
                                <Breadcrumb.Item className="accent-color" onClick={() => setHash("#./")}><AiFillFolder/></Breadcrumb.Item>
                            )
                        }
    
                        if (index == hash_array_length -1 || item.length == 0) {
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