//this component will be used to display the content of the file

import ErrorBoundary from "../error_boundary/ErrorBoundary";
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

    console.log(contents_file);
    console.log(mode);
    console.log(hash);

    //function here that will determine if the hash contains a uri
    //if it does then we visualise the metadata only of the uri and a external link to the uri
    function checkHash(hash: string) {
        if (hash) {
            if (hash.includes("http://") || hash.includes("https://")) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    //function to extract url from hash if checkhash returns true
    function extractUrl(hash: string) {
        //split string by http:// or https://
        if (hash.includes("http://")) {
            return "http://" +  hash.split("http://")[1];
        }
        else {
            return "https://"+hash.split("https://")[1];
        }
    }

    const uri_hash = checkHash(hash) ? extractUrl(hash) : "";
        
    return (
        loading ?
        <></>
        :
        hash ?
        checkHash(hash) ?
        rocrate["@graph"].map((item: any) => {
            if (item["@id"] == uri_hash) {
                return (<>
                    <div className="file-viewer">
                        <div className="file-viewer-header">
                            <h1>External Link</h1>
                        </div>
                        <div className="file-viewer-body">
                            <a href={uri_hash} rel="norefferer" target="_blank">{uri_hash}</a>
                        </div>
                    </div>
                    <div>
                        <h1>Metadata</h1>
                        <pre>{JSON.stringify(item, null, 2)}</pre>

                    </div>
                </>)
            }
        })
        :
        mode == "content" ?
        rocrate["@graph"].map((item: any) => {
            if (item["@id"] == hash.replace("#", "")) {
                if (item["@type"] == "File") {
                    //get the file extension
                    const docs = [{uri: item["@id"]}]
                    const previewer_class = getPreviewerClass(item["@id"]);

                    return (
                        <ErrorBoundary>
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
                                    <ReactPlayer url={item["@id"]} controls />
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
                        </ErrorBoundary>
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