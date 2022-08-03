//3th party imports here
import React, {useEffect,useState} from 'react';
import {
    BsFillFileEarmarkFill,
    BsFillFileEarmarkImageFill,
    BsFillFileEarmarkFontFill,
    BsFillFileEarmarkMusicFill,
    BsFillFileEarmarkRuledFill,
    BsFillFileEarmarkPdfFill,
    BsFillFileEarmarkZipFill, 
    BsFillFileEarmarkWordFill, 
    BsFillFileEarmarkCodeFill,
    BsFillFileEarmarkEaselFill,
    BsFillFileEarmarkPlayFill
} from 'react-icons/bs';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

//css import here

const mime = require('mime');

function get_file_type(file) {
    //get extention of the file
    let extention = file.split(".").pop();
    //get mimetype of the extention
    let mimetype = mime.getType(extention);
    return mimetype;
  }

function FileIconElement(props) {
  //props
  const setHash = props.setHash;
  const setSelectedFile = props.setSelectedFile;
  const currentbreadcrumb = props.currentbreadcrumb;
  const file_id = props.file_id;
  const toreturnfile_id = props.toreturnfile_id;

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {file_id}
    </Tooltip>
  );

  //get the mimetype of the fileid
  try {
    var mimetype = get_file_type(file_id);
  } catch (error) {
    var mimetype = "error";
  }
  if ( mimetype== null){
    mimetype = file_id.split(".").pop();
  }

  console.log(mimetype);
  
  //child component function to determine what icon to show
  const IconShow = (props) => {
    var file_mimetype = props.file_mimetype;
    console.log(file_mimetype);
    if (file_mimetype.includes("text")) {
        console.log("text");
        return (
            <BsFillFileEarmarkFontFill></BsFillFileEarmarkFontFill>
        );
    } 
    if (file_mimetype.includes("image")) {
        return (
            <BsFillFileEarmarkImageFill></BsFillFileEarmarkImageFill>
        );
    } 
    if (file_mimetype.includes("video")) {
        return(
            <BsFillFileEarmarkPlayFill></BsFillFileEarmarkPlayFill>
        );
    }
    if (file_mimetype.includes("audio")) {
        return(
            <BsFillFileEarmarkMusicFill></BsFillFileEarmarkMusicFill>
        );
    }
    if (file_mimetype.includes("pdf")) {
        return (
           <BsFillFileEarmarkPdfFill></BsFillFileEarmarkPdfFill>
        );
    }
    if (file_mimetype.includes("word")) {
        return (<BsFillFileEarmarkWordFill></BsFillFileEarmarkWordFill>);
    }
    if (file_mimetype.includes("excel")) {
        return (<BsFillFileEarmarkRuledFill></BsFillFileEarmarkRuledFill>);
    }
    if (file_mimetype.includes("pptx")) {
        return (<BsFillFileEarmarkEaselFill></BsFillFileEarmarkEaselFill>);
    }
    if (file_mimetype.includes("zip")) {
        return (<BsFillFileEarmarkZipFill></BsFillFileEarmarkZipFill>);
    
    } 
    if(file_mimetype.includes("r") || file_mimetype.includes("py") || file_id.includes("sh")){
        return (<BsFillFileEarmarkCodeFill></BsFillFileEarmarkCodeFill>);
    }
    else {
        return (<BsFillFileEarmarkFill></BsFillFileEarmarkFill>);
    }
  }
  
  return (
    <>
        <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
        <button className="filebutton navbarbutton" onClick={() => {setSelectedFile(file_id);setHash(currentbreadcrumb+file_id);}}><IconShow file_mimetype={mimetype}></IconShow>: {toreturnfile_id}</button>
    </OverlayTrigger>
    </>
  );

}

export default FileIconElement;