//this component will contain the file menu 
import { tryExtractWindowQueryParam } from "../../utils/hash_handler";
import { AiFillEye , AiOutlineDownload } from "react-icons/ai";
import {SiGraphql} from "react-icons/si";
import {HiExternalLink} from "react-icons/hi";

export default function FileMenu(props: any) {
    const rocrate = props.rocrate;
    const hash = props.hash;
    const loading = props.loading;
    const setNoQCheck = props.setNoQCheck;
    const no_q_check = props.no_q_check;

    //function insertUrlParam that will insert a new query param to the url
    const insertUrlParam = (key: any, value: any) => {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString() + "#" + hash.replace("#", "");
        window.history.pushState({path:newurl},'',newurl);
        window.location.hash = hash;
        setNoQCheck(no_q_check + 1);
    }

    //function to check if hash is url
    const isUrl = (str: any) => {
        if (str.includes("http://") || str.includes("https://")) {
            return true;
        } else {
            return false;
        }
    }


    //function that will do a target blank on the download link
    const downloadFile = (url: any) => {
        window.open(url, '_blank');
    }

    return (
        loading ?
        <></>
        :
        hash ?
        rocrate["@graph"].map((item: any) => {
            if (item["@id"] == hash.replace("#", "")) {
                if (item["@type"] == "File" || isUrl(hash.replace("#", ""))) {
                    return (
                        <div className="file_menu">
                            {
                            tryExtractWindowQueryParam(window.location.search) == "metadata" ?
                                <button className="file_menu_button_active" disabled><SiGraphql/></button>
                                :
                                <button className="file_menu_button" onClick={() => insertUrlParam("mode","metadata")}><SiGraphql/></button>
                            }
                            {
                            tryExtractWindowQueryParam(window.location.search) == "content" ?
                                isUrl(hash.replace("#", "")) ?
                                <button className="file_menu_button_active" disabled><HiExternalLink/></button>
                                :
                                <button className="file_menu_button_active" disabled><AiFillEye/></button>
                                :
                                isUrl(hash.replace("#", "")) ?
                                <button className="file_menu_button" onClick={()=> downloadFile(hash.replace("#", ""))}><HiExternalLink/></button>
                                :
                                <button className="file_menu_button" onClick={() => insertUrlParam("mode","content")}><AiFillEye/></button>
                            }
                            {
                            isUrl(hash.replace("#", "")) ?
                                <></>
                                :
                                <button className="file_menu_button" onClick={() => downloadFile(item["@id"])}><AiOutlineDownload/></button>
                            }
                        </div>
                    )
                }
            }
        })
        :
        <></>
    )
}