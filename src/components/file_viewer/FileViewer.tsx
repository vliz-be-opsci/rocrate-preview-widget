//this component will be used to display the content of the file

import { tryExtractWindowQueryParam } from "../../utils/hash_handler";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import Otherview from "./Otherview";
import ReactAudioPlayer from 'react-audio-player';
import ReactPlayer from 'react-player';
import MarkdownViewer from "./MarkdownViewer";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getPreviewerClass } from "./previewer_chooser";
import CsvViewer from "./CsvViewer";
//import FileViewer from "react-file-viewer";
//import FileViewError from "./FileViewError";

export default function FileViewerComponent(props: any) {
    const rocrate = props.rocrate;
    const hash = props.hash;
    const loading = props.loading;
    const contents_file = props.contents_file;
    const mode = props.mode;
    const extrafileviewmode = props.extrafileviewmode;
    const setExtraFileViewMode = props.setExtraFileViewMode;

    console.log(contents_file)

    return (
        loading ?
        <></>
        :
        hash ?
        mode == "content" ?
        rocrate["@graph"].map((item: any) => {
            if (item["@id"] == hash.replace("#", "")) {
                if (item["@type"] == "File") {
                    //get the file extension
                    const docs = [{uri: item["@id"]}]
                    const previewer_class = getPreviewerClass(item["@id"]);

                    return (
                        <div className="file-viewer">
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
                                previewer_class == "video" ?
                                <ReactPlayer url={item["@id"]} />
                                :
                                previewer_class == "code" ?
                                <SyntaxHighlighter language="javascript" style={monokai}>
                                    {contents_file}
                                </SyntaxHighlighter>
                                :
                                previewer_class == "csv" ?
                                <CsvViewer content={contents_file} extrafileviewmode={extrafileviewmode} setExtraFileViewMode={setExtraFileViewMode}/>
                                :
                                previewer_class == "markdown" ?
                                <MarkdownViewer content={contents_file} extrafileviewmode={extrafileviewmode} setExtraFileViewMode={setExtraFileViewMode}/>
                                :
                                <Otherview/>
                                //<DocViewer documents={docs} pluginRenderers={DocViewerRenderers}/>
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