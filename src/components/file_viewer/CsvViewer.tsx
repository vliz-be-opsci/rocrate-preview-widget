//this component will be used to display the csv file
// it will have a radio button that will allow the user to view the raw csv file or the csv file as a table
import Papa from 'papaparse';
import CsvTable from './CsvTable';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CsvViewer(props: any) {
    const content  = props.content;
    console.log(content);
    let csv = Papa.parse(content);
    console.log(csv);

    const extrafileviewmode = props.extrafileviewmode;
    const setExtraFileViewMode = props.setExtraFileViewMode;

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
    else{
        return (
            <div id="csv_viewer">
                <div id="csv_viewer_radio_buttons" className='formatbuttons'>
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
                <div id="csv_viewer_content">
                    {
                        extrafileviewmode== "1" ?
                        //check if the csv is empty
                        <CsvTable csv={csv}/>
                        :
                        <SyntaxHighlighter style={monokai}>{content}</SyntaxHighlighter>
                    }
                </div>
            </div>
        )
    }

    
}