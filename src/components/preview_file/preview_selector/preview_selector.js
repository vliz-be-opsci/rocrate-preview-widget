//3th party imports here
import React, {useEffect,useState} from 'react';
import FilePreview from "react-file-preview-latest";
import ReactAudioPlayer from 'react-audio-player';
import ReactPlayer from 'react-player';
import Papa from 'papaparse';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import {Alert} from 'react-bootstrap';
// const imports here  
import CodeHightlight from '../code_highlight/code_highlight';

function PreviewSelectorFile(props) {
    //constants
    //bindings and state
    const [Dataset, setDataset] = useState([]);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [file_url, setFileurl] = useState("");
    const [csvdone, setCsvdone] = useState(false);


    var file_mimetype = "";
    try {
        file_mimetype = props.file_mimetype;
    } catch (error) {
        console.log(error);
    }

    function Getfileurl(){
        console.log(props);
        var file_urle = "";
        try {
            file_urle = props.file_url;
            GetCsvdata(file_urle);
            setFileurl(file_urle);
        } catch (error) {
            console.log(error);
        }
    }

    //refresh the page whenever props.file_url changes
    useEffect(() => {
        Getfileurl();
    }, [props.file_url]);

    //function here that wil return a message that displays that the file couldn't be previewed but that it still is downloadbale
    function Nopreview(props) {
        console.log(props);
        return (
            <Alert variant="warning">
                <div className="errorhash">
                    <Alert.Heading>File preview failed</Alert.Heading>
                    <p>
                        File: <b>{props.file_url}</b> couldn't be previewed but it is still downloadable.
                    </p>
                </div>
            </Alert>
        );
    }

    function GetCsvdata() {
        console.log(file_url);
        let test_file_url = "https://raw.githubusercontent.com/vliz-be-opsci/test-rocrate-media/main/data/count_thes_terms.csv";
        setCsvdone(false);
        try{
            Papa.parse(file_url, { // test_file_url, file_url
                download: true,
                dynamicTyping: true,
                error: function(error) {
                    console.log(error);
                },
                complete: function(results) {
                    console.log(results);
                    var columns  = [];
                    var rows = [];
                    for (let i = 0; i < results.data.length; i++) {
                        if(i==0){
                            for (let j = 0; j < results.data[i].length; j++) {
                                if(j==0){
                                    columns.push({
                                        key: results.data[i][j],
                                        name: results.data[i][j],
                                        resizable: true,
                                        suppressSizeToFit: true
                                    });
                                }else{
                                    columns.push({
                                        key: results.data[i][j],
                                        name: results.data[i][j],
                                        resizable: true,
                                        suppressSizeToFit: true
                                    });
                                }
                            }
                        }
                        else{
                            var currrow = {};
                            for (let j = 0; j < results.data[i].length; j++) {
                                //if results.data[i][j] is null then set it to empty string
                                if(results.data[i][j] == null){
                                    currrow[columns[j].key] = "null";
                                }else{
                                    //if the results.data[i][j] is an object then convert it to string
                                    if(typeof results.data[i][j] === "object"){
                                        currrow[columns[j].key] = JSON.stringify(results.data[i][j]);
                                    }else{
                                        currrow[columns[j].key] = results.data[i][j];
                                    }
                                }
                            }
                            rows.push(currrow);
                        }
                    }
                    setColumns(columns);
                    setRows(rows);
                    setDataset(results.data);
                    setCsvdone(true);
                }
            });
        }catch(error){
            console.log(error);
            setCsvdone(false);
        }
    }
    //function to get the file type, text, image, video, audio, pdf, word, excel, ppt, zip, etc
    function getFileType(file_mimetype) {
        //go over each code mimetype and return the file type py, r, sh , js, etc
        console.log(file_url);
        try {
            if(file_url.split(".").pop().includes("py")){
                console.log("python");
                return <CodeHightlight className='code-preview' url= {file_url} language="python"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("r")){
                return <CodeHightlight className='code-preview' url= {file_url} language="r"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("sh")){
                return <CodeHightlight className='code-preview' url= {file_url} language="shell"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("js")){
                return <CodeHightlight className='code-preview' url ={file_url} language="javascript"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("css")){
                return <CodeHightlight className='code-preview' url ={file_url} language="css"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("json")){
                return <CodeHightlight className='code-preview' url ={file_url} language="json"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("md")){
                return <CodeHightlight className='code-preview' url ={file_url} language="markdown"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("xml")){
                return <CodeHightlight className='code-preview' url ={file_url} language="xml"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("sql")){
                return <CodeHightlight className='code-preview' url ={file_url} language="sql"></CodeHightlight>;
            }
            if(file_url.split(".").pop().includes("php")){
                return <CodeHightlight className='code-preview' url ={file_url} language="php"></CodeHightlight>;
            }
            if (file_mimetype.includes("text")) {
                console.log(file_url.split(".").pop());
                if(file_url.split(".").pop().includes("csv")){
                    if(csvdone){
                        console.log(columns);
                        console.log(rows);
                        return <FilePreview
                        className='general_file_preview'
                        type={"url"}
                        url={file_url}
                        onError={Nopreview(file_url)}
                        />
                        return <DataGrid columns={columns} rows={rows} />;
                    }else{
                        return (<Nopreview url={file_url}></Nopreview>);
                    }
                }
                return (
                    <FilePreview
                      className='general_file_preview'
                      type={"url"}
                      url={file_url}
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
                      onError={console.log('error has occured')}
                    />
                )
            } else if (file_mimetype.includes("word")) {
                return(<Nopreview file_url={file_url}/>);
            } else if (file_mimetype.includes("excel")) {
                return(<Nopreview file_url={file_url}/>);
            } else if (file_mimetype.includes("ppt")) {
                return(<Nopreview file_url={file_url}/>);
            } else if (file_mimetype.includes("zip")) {
                return(<Nopreview file_url={file_url}/>);
            } else {
                //check i file name includes xlsx
                if (file_url.includes("xlsx")) {
                    console.log("excel");
                    return(<Nopreview file_url={file_url}/>);
                } else {
                    return(<Nopreview file_url={file_url}/>);
                }
            }
        } catch (error) {
            console.log(error);
            //convert error object to text
            var error_json = JSON.stringify(error);
            return(
                <Alert variant="danger">
                  <div className="errorhash">
                    <Alert.Heading>Preview file error</Alert.Heading>
                    <p>
                        {error_json}
                    </p>
                    <p>
                        You can still download the file from this <a href={file_url}>link</a>
                    </p>
                  </div>
                </Alert>
              );
        }
        
    }

    // on component mount 
    useEffect(() => {
        console.log("component mounted");
        Getfileurl();
        GetCsvdata(file_url);
    }, []);

    useEffect(() => {GetCsvdata(file_url);}, [file_url]);
    
    //have elegant fail for file preview
    try {
        return (
            <div className="preview-file">
                {getFileType(file_mimetype)}
            </div>
        );
    } catch (error) {
        var error_json = JSON.stringify(error);
        return(
            <Alert variant="danger">
              <div className="errorhash">
                <Alert.Heading>Preview file error</Alert.Heading>
                <p>
                    {error_json}
                </p>
                <p>
                    You can still download the file from this <a href={file_url}>link</a>
                </p>
              </div>
            </Alert>
          );
    } 

    


}

export default PreviewSelectorFile;