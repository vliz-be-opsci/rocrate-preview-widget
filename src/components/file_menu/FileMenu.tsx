//this component will contain the file menu 
import { tryExtractWindowQueryParam } from "../../utils/hash_handler";
import { AiFillFolderOpen, AiFillFileUnknown , AiOutlineDownload } from "react-icons/ai";

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
                if (item["@type"] == "File") {
                    return (
                        <div className="file_menu">
                            {
                            tryExtractWindowQueryParam(window.location.search) == "metadata" ?
                                <button className="file_menu_button_active" disabled><AiFillFolderOpen/></button>
                                :
                                <button className="file_menu_button" onClick={() => insertUrlParam("window","metadata")}><AiFillFolderOpen/></button>
                            }
                            {
                            tryExtractWindowQueryParam(window.location.search) == "content" ?
                                <button className="file_menu_button_active" disabled><AiFillFileUnknown/></button>
                                :
                                <button className="file_menu_button" onClick={() => insertUrlParam("window","content")}><AiFillFileUnknown/></button>
                            }
                            <button className="file_menu_button" onClick={() => downloadFile(item["@id"])}><AiOutlineDownload/></button>
                        </div>
                    )
                }
            }
        })
        :
        <></>
    )
}