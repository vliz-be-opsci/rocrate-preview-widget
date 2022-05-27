//imports
import React, {useEffect,useState} from 'react';

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
        <>mardown text : {mdText}</>
    )
    
}

export default MarkdownReadme;