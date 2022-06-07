//imports
import React, {useEffect,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function CodeHightlight(props) {
    //variables
    const url = props.url;
    const language = props.language;

    //bindings and state
    const [codeText, setcodeText] = useState('');

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
            })
            .catch((error) => console.error(error));
    });

    //return table of the data
    try {
        return (
            <SyntaxHighlighter language={language} style={monokai}>
            {codeText}
            </SyntaxHighlighter>
        )
    } catch (error) {
        return (<>{codeText}</>)
    } 
}

export default CodeHightlight;