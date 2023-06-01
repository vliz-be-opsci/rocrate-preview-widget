//this component will be used to display the content of the file

import { tryExtractWindowQueryParam } from "../../utils/hash_handler";
import DocViewer from "@cyntler/react-doc-viewer"
//import FileViewer from "react-file-viewer";
//import FileViewError from "./FileViewError";

export default function FileViewerComponent(props: any) {
    const rocrate = props.rocrate;
    const hash = props.hash;
    const loading = props.loading;
    const contents_file = props.contents_file;

    return (
        loading ?
        <></>
        :
        hash ?
        tryExtractWindowQueryParam(window.location.search) == "content" ?
        rocrate["@graph"].map((item: any) => {
            if (item["@id"] == hash.replace("#", "")) {
                if (item["@type"] == "File") {
                    //get the file extension
                    const file_extension = item["@id"].split(".").pop();
                    const docs = [{uri: item["@id"]}]
                    //console.log(file_extension);
                    return (
                        <div className="file-viewer">
                            <DocViewer documents={docs} />
                        </div>
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