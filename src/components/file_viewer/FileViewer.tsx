//this component will be used to display the content of the file

import ErrorBoundary from "../error_boundary/ErrorBoundary";
import Otherview from "./Otherview";
import ReactAudioPlayer from 'react-audio-player';
import ReactPlayer from 'react-player';
import MarkdownViewer from "./MarkdownViewer";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getPreviewerClass } from "./previewer_chooser";
import {  AiFillFolder, AiFillFileText } from "react-icons/ai";
import {FaGlobe} from "react-icons/fa";
import { getLabelValue, getItemFromGraph } from "../../utils/graph_utils";
import CsvViewer from "./CsvViewer";
//import FileViewer from "react-file-viewer";
//import FileViewError from "./FileViewError";

//function that will check if a given string is a uri or not
function isUri(str: string) {
    return str.includes("http://") || str.includes("https://");
}

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

                                                                if (value["@id"].slice(-1) == "/" && value["@id"].slice(0, 1) == ".") {
                                                                    return (
                                                                        <li className="secondary-color">
                                                                            <a className="clickable" href={"#"+value["@id"]}><AiFillFolder/> { getLabelValue(getItemFromGraph(rocrate, value["@id"]))}</a>
                                                                        </li>
                                                                    )
                                                                }else{
                                                                    if (isUri(value["@id"])) {
                                                                        return (
                                                                            <li className="secondary-color">
                                                                                <a className="clickable" href={"#"+value["@id"]}><FaGlobe/> {getLabelValue(getItemFromGraph(rocrate, value["@id"]))}</a>
                                                                            </li>
                                                                        )
                                                                    }else{
                                                                        return (
                                                                            <li className="secondary-color">
                                                                                <a className="clickable" href={"#"+value["@id"]}><AiFillFileText/> {getLabelValue(getItemFromGraph(rocrate, value["@id"]))}</a>
                                                                            </li>
                                                                        )
                                                                    }
                                                                }
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