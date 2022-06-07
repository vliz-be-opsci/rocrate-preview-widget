//3th party imports here
import React, {useEffect,useState} from 'react';
import FilePreview from "react-file-preview-latest";
import ReactAudioPlayer from 'react-audio-player';
import ReactPlayer from 'react-player';
import XlsxViewer from '../xlsx_viewer/xlsx_viewer';
import Papa from 'papaparse';
import DataGrid from 'react-data-grid';
//css import here
import './preview_file.css';

// const imports here  



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
    const [dataset, setDataset] = useState({});
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);

    //methods
    function GetCsvdata(props) {
        var file_url = props.file_url;
        //file_url = "https://raw.githubusercontent.com/vliz-be-opsci/test-rocrate-media/main/data/count_thes_terms.csv";
        Papa.parse(file_url, {
            download: true,
            dynamicTyping: true,
            error: function(error) {
                console.log(error);
            },
            complete: function(results) {
                var columns  = [];
                var rows = [];
                for (let i = 0; i < results.data.length; i++) {
                    if(i==0){
                        for (let j = 0; j < results.data[i].length; j++) {
                            columns.push({
                                key: results.data[i][j],
                                name: results.data[i][j]
                            });
                        }
                    }
                    else{
                        var currrow = {};
                        for (let j = 0; j < results.data[i].length; j++) {
                            currrow[columns[j].key] = results.data[i][j];
                        }
                        rows.push(currrow);
                    }
                }
                setColumns(columns);
                setRows(rows);
                setDataset(results.data);
            }
        });
    }
    //function to get the file type, text, image, video, audio, pdf, word, excel, ppt, zip, etc
    function getFileType(file_mimetype) {
        if (file_mimetype.includes("text")) {
            console.log(file_url.split(".").pop());
            if(file_url.split(".").pop().includes("csv")){
                console.log(columns);
                console.log(rows);
                return <DataGrid columns={columns} rows={rows} />;
            }
            return (
                <FilePreview
                  className='general_file_preview'
                  type={"url"}
                  url={file_url}
                  height={"50vh"}
                  width={"100%"}
                  onError={console.log('error has occured')}
                />
            )
        } else if (file_mimetype.includes("image")) {
            console.log("image");
            return (
                <FilePreview
                  className='general_file_preview'
                  type={"url"}
                  url={file_url}
                  height={"50vh"}
                  width={"100%"}
                  onError={console.log('error has occured')}
                />
            )
        } else if (file_mimetype.includes("video")) {
            console.log("video");
            return(
                <ReactPlayer url={file_url} controls={true} className='videoplayer'/>
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
                  height={"50vh"}
                  width={"100%"}
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

    // on component mount 
    useEffect(() => {
        console.log("component mounted");
        GetCsvdata(file_url);
    }, []);
    
   
    return (
        <div className="preview-file">
            {getFileType(file_mimetype)}
        </div>
    );


}

export default PreviewFile;