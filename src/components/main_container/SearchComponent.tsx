import * as React from "react";
import { useState } from "react";

interface SearchComponentProps {
    rocrate: any;
    onSelect: (id: string) => void;
}

export default function SearchComponent({ rocrate, onSelect }: SearchComponentProps) {
    const [searchText, setSearchText] = useState("");
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setSearchText(text);
        if (text) {
            const filteredResults = rocrate["@graph"].filter((item: any) =>
                item["@id"].includes(text)
            );
            setResults(filteredResults);
        } else {
            setResults([]);
        }
    };

    const handleSelect = (id: string) => {
        onSelect(id);
        setSearchText("");
        setResults([]);
    };

    return (
        <div>
            <input
                type="text"
                value={searchText}
                onChange={handleSearch}
                placeholder="Search by @id"
                className="border p-2 rounded"
            />
            <ul>
                {results.map((result, index) => (
                    <li key={index} className="p-2 border-b cursor-pointer" onClick={() => handleSelect(result["@id"])}>
                        {result["@id"]}
                    </li>
                ))}
            </ul>
        </div>
    );
}
