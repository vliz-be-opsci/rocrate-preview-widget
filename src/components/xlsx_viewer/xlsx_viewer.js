//imports
import React, {useEffect,useState} from 'react';
import readXlsxFile from 'read-excel-file';
const excelToJson = require('convert-excel-to-json');

function XlsxViewer(props) {
    //variables
    var file = "";
    try {
      file = props.file;  
      console.log(props.file);
    } catch (error) {
        console.log(error);
    }
    
    const [data, setData] = useState([]);

    //bindings and state

    //methods

    //function that will take the file and parse it through the readXlsxFile function adn put the data in setData
    function parseFile(file) {
        const result = excelToJson({sourceFile: file});
        console.log(result);
        setData(result);
    }

     parseFile(file);


    //return table of the data
    if(data.length > 0) {
        //return table of the data
        return (
            <>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            {data[0].map((item, index) => {
                                return (
                                    <th key={index}>{item}</th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(1).map((item, index) => {
                            return (
                                <tr key={index}>
                                    {item.map((item, index) => {
                                        return (
                                            <td key={index}>{item}</td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </>
        )
    } else {
        return (
            <></>
        )
    }
    
}

export default XlsxViewer;