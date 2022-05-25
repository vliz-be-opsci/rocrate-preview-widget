//imports here
import React, {useEffect,useState} from 'react';
import FilePreview from "react-file-preview-latest";
import ReactAudioPlayer from 'react-audio-player';
import ReactPlayer from 'react-player';
import XlsxViewer from '../xlsx_viewer/xlsx_viewer';

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
                  type={"url"}
                  url={file_url}
                  width={"100%"}
                  height={"100%"}
                  onError={console.log('error has occured')}
                />
            )
        } else if (file_mimetype.includes("image")) {
            console.log("image");
            return (
                <FilePreview
                  type={"url"}
                  url={file_url}
                  width={"100%"}
                  height={"100%"}
                  onError={console.log('error has occured')}
                />
            )
        } else if (file_mimetype.includes("video")) {
            console.log("video");
            return(
                <ReactPlayer url={file_url} controls={true} />
            )
        } else if (file_mimetype.includes("audio")) {
            console.log("audio");
            return(
                <ReactAudioPlayer
                    src={file_url}
                    autoPlay="false"
                    controls="true"
                />
            )
        } else if (file_mimetype.includes("pdf")) {
            console.log("pdf");
            return (
                <FilePreview
                  type={"url"}
                  url={file_url}
                  width={"100%"}
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
                    <XlsxViewer file={file_url} />
                )
            } else {
                return "other";
            }
        }
    }
    
    //rendering
    return (
        <>
        <h5>preview : {getFileType(file_mimetype)}</h5>
        </>
    );
    

}

export default PreviewFile;