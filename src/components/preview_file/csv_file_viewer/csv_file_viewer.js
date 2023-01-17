import React, {useEffect,useState} from 'react';

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


    return (
        <div className="csv-preview">
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
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
                                        <td key={column.key}>{row[column.key]}</td>
                                    ))}
                                </tr>
                            )
                        }
                    })}
                </tbody>
            </table>
        </div>
    )
}
export default CsvFileViewer;