import * as React from "react";
import { useState, useRef, useEffect } from "react";
import SearchDropdown from "./SearchDropdown";

interface SearchComponentProps {
    rocrate: any;
    onSelect: (id: string) => void;
    onClose: () => void;
    onFocus: () => void;
    onResults: (results: any[]) => void;
}

export default function SearchComponent({ rocrate, onSelect, onFocus, onResults }: SearchComponentProps) {
    const [searchText, setSearchText] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setSearchText(text);
        if (text) {
            const filteredResults = rocrate["@graph"].filter((item: any) =>
                item["@id"].includes(text)
            );
            setResults(filteredResults);
            onResults(filteredResults);
        } else {
            setResults([]);
            onResults([]);
        }
    };

    const handleSelect = (id: string) => {
        onSelect(id);
        setSearchText("");
        setResults([]);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setSearchText("");
            setResults([]);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={searchRef}>
            <input
                type="text"
                value={searchText}
                onChange={handleSearch}
                onFocus={onFocus}
                placeholder="Search by @id"
                className="border p-2 rounded"
            />
        </div>
    );
}
