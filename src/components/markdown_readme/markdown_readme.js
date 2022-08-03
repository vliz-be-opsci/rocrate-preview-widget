//imports
import React, {useEffect,useState} from 'react';
import ReactMarkdown from 'react-markdown';

//import the css
import './markdown_readme.css';

function MarkdownReadme(props) {
    //variables
    const url = props.url;

    //bindings and state
    const [mdText, setMdText] = useState('');

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
                setMdText(text);
            })
            .catch((error) => console.error(error));
    });

    //return table of the data
    return (
        <div className="readme">
        <div className="readme-content">
            <ReactMarkdown>{mdText}</ReactMarkdown>
        </div>
        </div>
    )
    
}

export default MarkdownReadme;