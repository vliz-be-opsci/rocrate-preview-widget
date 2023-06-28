//compoentn where the table will reside
import { useState } from "react";
import $ from 'jquery';

export default function CsvTable(props: any) {
    const csv = props.csv;
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState(csv.data);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        filterprops(e.target.value);
    };

    const filterprops = (searchQuery) => {
        const filteredData = csv.data.filter((item) => {
            return Object.keys(item).some((key) =>
                item[key].toString().toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
        setFilteredData(filteredData);
        console.log(filteredData);
    };

    //function to add yellow highlight to the search query
    const highlight = (text: string) => {
        //get the search query
        const search_query = searchQuery;
        //get the index of the search query
        const index = text.indexOf(search_query);
        //if the search query is found
        if (index !== -1) {
            //get the length of the search query
            const length = search_query.length;
            //get the first part of the text
            const prefix = text.substr(0, index);
            //get the middle part of the text
            const middle = text.substr(index, length);
            //get the last part of the text
            const suffix = text.substr(index + length);
            //return the text with the highlighted search query
            return (
                <span>
                    {prefix}
                    <span className="highlight">{middle}</span>
                    {suffix}
                </span>
            );
        }
        //if the search query is not found
        else {
            //return the text
            return (
                <span>
                    {text}
                </span>
            )
        }
    }


    if (csv !== "None") {
        return (
            <>
            <input type="text" placeholder="Search" onChange={handleSearch} />
            <table>
                <thead>
                    <tr>
                        {
                            csv.data[0].map((item: any) => {
                                return (
                                    <th>{item}</th>
                                )
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        filteredData.map((item: any) => {
                            return (
                                <tr>
                                    {
                                        item.map((item: any) => {
                                            return (
                                                <td>{highlight(item)}</td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>   
            </>
        )
    }
}