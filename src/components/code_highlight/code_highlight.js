//imports
import React, {useEffect,useState} from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import FilePreview from "react-file-preview-latest";
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {Alert} from 'react-bootstrap';

//import css here
import './code_highlight.css';

function CodeHightlight(props) {
    //variables
    const url = props.url;
    const language = props.language;

    //bindings and state
    const [codeText, setcodeText] = useState('');
    const [errorhash, setErrorHash] = useState(false);

    //methods
    useEffect(() => {
        const fetchurlarray = url.split("./");
        const fetchurl = fetchurlarray[1];
        console.log(fetchurl);
        fetch(fetchurl)
            .then((response) => {
                if (response.ok) return response.text();
                else return Promise.reject("Didn't fetch text correctly");
            })
            .then((text) => {
                setcodeText(text);
                console.log(text);
            })
            .catch((error) => console.error(error));
    });

    //child function to display the error
    function ErrorHash(props) {
        if (errorhash) {
          var error = props.error;
          return(
            <Alert variant="warning" onClose={() => setErrorHash(false)} dismissible>
              <div className="errorhash">
                <Alert.Heading>Code hightlight failed</Alert.Heading>
                <p>
                    {error}
                </p>
                <p>
                    The code will be displayed as plain text.
                </p>
              </div>
            </Alert>
          );
        }else{
          return (<></>);
        }
      }

    //return table of the data
    try {
        return (
            <div>
                <SyntaxHighlighter className="synthax_file_preview" language={language} style={monokai} showLineNumbers wrapLongLines height={"50vh"}>
                    {codeText}
                </SyntaxHighlighter>
            </div>
        )
    } catch (error) {
        setErrorHash(true);
        return (
        <div>
            <ErrorHash error={error}></ErrorHash>
            <FilePreview
                className='general_file_preview'
                type={"url"}
                url={url}
                height={"55vh"}
                width={"100%"}
                onError={console.log('error has occured')}
            />
        </div>)
    } 
}

export default CodeHightlight;