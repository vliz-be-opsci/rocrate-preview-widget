// component to display a raw or formatted markdown file

import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function MarkdownViewer(props: any) {
    const content = props.content;
    const extrafileviewmode = props.extrafileviewmode;
    const setExtraFileViewMode = props.setExtraFileViewMode;

    const radios = [
        { name: 'Raw', value: '1' },
        { name: 'Formatted', value: '2' }
    ];

    //function that will change the view mode and will change the state if the button clicked to active
    const changeButtonClass = (e: any) => {
        //get the button that was clicked
        const button = e.target;
        //get the button that is active
        const active_button = document.getElementsByClassName("file_menu_button_active")[1];
        //remove the active class from the active button
        active_button.classList.remove("file_menu_button_active");
        active_button.classList.add("file_menu_button");
        //add the active class to the button that was clicked
        button.classList.remove("file_menu_button");
        button.classList.add("file_menu_button_active");
        //change the view mode
        setExtraFileViewMode(button.value);
    }

    if (content == "") {
        return (
            <p>Something went wrong</p>
        )
    }
    else {
        return (
            <div id="markdown_viewer">
                <div id="markdown_viewer_radio_buttons">
                    {
                        extrafileviewmode == "1" ?
                        <>
                        <button value="1" onClick={(e) => changeButtonClass(e)} className="file_menu_button_active">
                            Formatted
                        </button>
                        <button value="2" onClick={(e) => changeButtonClass(e)} className="file_menu_button">
                            Raw
                        </button>
                        </>
                        :
                        <>
                        <button value="1" onClick={(e) => changeButtonClass(e)} className="file_menu_button">
                            Formatted
                        </button>
                        <button value="2" onClick={(e) => changeButtonClass(e)} className="file_menu_button_active">
                            Raw
                        </button>
                        </>
                    }
                    
                </div>
                <div id="markdown_viewer_content">
                    {
                        extrafileviewmode == "1" ?
                            //check if the csv is empty
                            <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
                            :
                            <SyntaxHighlighter style={monokai}>{content}</SyntaxHighlighter>
                    }
                </div>
            </div>
        )
    }
}