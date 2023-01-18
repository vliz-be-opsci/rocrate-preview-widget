import React, {useEffect,useState} from 'react';
import {BsSearch} from 'react-icons/bs';
const CsvFileViewer = (props) => {
    //return a simple table
    let columns = props.columns;
    let rows = props.rows;

    //add a search parameter
    const [search, setSearch] = useState("");
    const [filteredRows, setFilteredRows] = useState(rows);

    useEffect(() => {
        //check each value in the rows and see if the search term is in the value if it is then add the row to the filteredRows
        //if it is not then do not add the row to the filteredRows
        let newFilteredRows = [];
        rows.forEach((row) => {
            let rowValues = Object.values(row);
            let rowValuesString = rowValues.toString().toLowerCase();
            let searchLower = search.toLowerCase();
            if(rowValuesString.includes(searchLower)) {
                newFilteredRows.push(row);
            }
        });
        setFilteredRows(newFilteredRows);
    }, [search, rows]);

    //function that will search if a given string contains a given search term 
    //if it does then it should return <span>sentence here of <div classname="searchedterm">search term</div></span>
    //if it does not then it should return <span>sentence here</span>
    const searchSentence = (sentence, searchTerm) => {
        try {
            let sentenceLower = sentence.toString().toLowerCase();
            let searchTermLower = searchTerm.toString().toLowerCase();
            //regex to find all occurences of the search term and replace it with <div classname="searchedterm">search term</div>
            let regex = new RegExp(searchTermLower, "g");
            let newSentence = sentenceLower.replace(regex, `<div style="background-color:yellow;display:inline">${searchTerm}</div>`);
            if(searchTerm === "") {
                return(<span>{sentence}</span>)
            }

            return(<span dangerouslySetInnerHTML={{__html: newSentence}}></span>)
        }catch(e) {
            console.log(e);
            return(<>{sentence}</>)
        }
    }


    return (
        <>
        <div className='searchbar-csv'>
            <div className='inline left'><BsSearch></BsSearch> | </div>
            <input
                type="text"
                className='searchbar-input'
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className='inline'>| Showing {filteredRows.length} of {rows.length} rows</div>
        </div>
        <div className="csv-preview">
            <table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key}>{column.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        //check if the row is in the filteredRows
                        //if it is then display the row
                        //if it is not then do not display the row
                        if(filteredRows.includes(row)) {
                            return (
                                <tr key={row.id}>
                                    {columns.map((column) => (
                                        <td key={column.key}>{searchSentence(row[column.key], search)}</td>
                                    ))}
                                </tr>
                            )
                        }
                    })}
                </tbody>
            </table>
        </div>
        </>
        
    )
}
export default CsvFileViewer;