//this component will contain the file menu 
import { AiFillEye , AiOutlineDownload } from "react-icons/ai";
import {HiExternalLink} from "react-icons/hi";
import {TbTable} from "react-icons/tb";

export default function FileMenu(props: any) {
    const rocrate = props.rocrate;
    const hash = props.hash;
    const loading = props.loading;
    const setmode = props.setmode;
    const mode = props.mode;


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
                                mode == "metadata" ?
                                <button className="file_menu_button_active" disabled><TbTable/></button>
                                :
                                <button className="file_menu_button" onClick={() => setmode("metadata")}><TbTable/></button>
                            }
                            {
                                mode == "content" ?
                                isUrl(hash.replace("#", "")) ?
                                <button className="file_menu_button_active" disabled><HiExternalLink/></button>
                                :
                                <button className="file_menu_button_active" disabled><AiFillEye/></button>
                                :
                                isUrl(hash.replace("#", "")) ?
                                <button className="file_menu_button" onClick={() => setmode("content")}><HiExternalLink/></button>
                                :
                                <button className="file_menu_button" onClick={() => setmode("content")}><AiFillEye/></button>
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