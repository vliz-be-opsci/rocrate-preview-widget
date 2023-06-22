//this component will be used to display the content of the file

import { tryExtractWindowQueryParam } from "../../utils/hash_handler";
import DocViewer from "@cyntler/react-doc-viewer";
import ReactAudioPlayer from 'react-audio-player';
import { getPreviewerClass } from "./previewer_chooser";
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
                    const docs = [{uri: item["@id"]}]
                    const previewer_class = getPreviewerClass(item["@id"]);

                    return (
                        <div className="file-viewer">
                            <p>{previewer_class}</p>
                            {
                                previewer_class == "audio" ?
                                <ReactAudioPlayer
                                    src={item["@id"]}
                                    controls
                                />
                                :
                                previewer_class == "image" ?
                                <img src={item["@id"]} className="image_preview"/>
                                :
                                previewer_class == "powerpoint" ?
                                <>
                                <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${item["@id"]}`}
                                    width="100%"
                                    height="600px"
                                ></iframe>
                                </>
                                :
                                <DocViewer documents={docs} />
                            }
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