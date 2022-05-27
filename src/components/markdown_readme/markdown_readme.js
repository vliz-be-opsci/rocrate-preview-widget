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
        fetch("https://raw.githubusercontent.com/Beamanator/fdi/master/README.md")
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
        <>markdown here</>
    )
    
}

export default MarkdownReadme;