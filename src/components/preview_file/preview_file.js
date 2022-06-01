//3th party imports here
import React, {useEffect,useState} from 'react';
import FilePreview from "react-file-preview-latest";
import ReactAudioPlayer from 'react-audio-player';
import ReactPlayer from 'react-player';
import XlsxViewer from '../xlsx_viewer/xlsx_viewer';
import FileViewer from 'react-file-viewer';

//css import here
import './preview_file.css';

function PreviewFile(props) {
    //constants
    console.log(props);
    var file_url = "";
    var file_mimetype = "";
    try {
        file_mimetype = props.file_mimetype;
    } catch (error) {
        console.log(error);
    }
    try {
        file_url = props.file_url;
    } catch (error) {
        console.log(error);
    }

    //bindings and state

    //methods
    //function to get the file type, text, image, video, audio, pdf, word, excel, ppt, zip, etc
    function getFileType(file_mimetype) {
        if (file_mimetype.includes("text")) {
            console.log("text");
            return (
                <FilePreview
                  className='general_file_preview'
                  type={"url"}
                  url={file_url}
                  min-height={"200px"}
                  height={"35vh"}
                  width={"50vw"}
                  onError={console.log('error has occured')}
                />
            )
        } else if (file_mimetype.includes("image")) {
            console.log("image");
            return (
                <FilePreview
                  className={'general_file_preview'}
                  type={"url"}
                  url={file_url}
                  min-height={"200px"}
                  height={"35vh"}
                  width={"50vw"}
                  onError={console.log('error has occured')}
                />
            )
        } else if (file_mimetype.includes("video")) {
            console.log("video");
            return(
                <ReactPlayer 
                    url={file_url} 
                    controls={true} 
                    className='videoplayer'
                />
            )
        } else if (file_mimetype.includes("audio")) {
            console.log("audio");
            return(
                <ReactAudioPlayer
                    src={file_url}
                    controls="true"
                />
            )
        } else if (file_mimetype.includes("pdf")) {
            console.log("pdf");
            return (
                <FilePreview
                  type={"url"}
                  url={file_url}
                  height={"100%"}
                  onError={console.log('error has occured')}
                />
            )
        } else if (file_mimetype.includes("word")) {
            return "word";
        } else if (file_mimetype.includes("excel")) {
            return "excel";
        } else if (file_mimetype.includes("ppt")) {
            return "ppt";
        } else if (file_mimetype.includes("zip")) {
            return "zip";
        } else {
            //check i file name includes xlsx
            if (file_url.includes("xlsx")) {
                console.log("excel");
                return (
                    <FileViewer
                        fileType={file_url.split(".").pop()}
                        filePath={file_url}
                        errorComponent={CustomErrorComponent}
                        onError={console.log('error has occured')}/>
                )
            } else {
                return "other";
            }
        }
    }
    
   
    return (
        <div className="preview-file">
            {getFileType(file_mimetype)}
        </div>
    );


}

export default PreviewFile;