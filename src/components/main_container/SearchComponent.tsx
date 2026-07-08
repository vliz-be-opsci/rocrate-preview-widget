import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { searchRoCrate } from "../../utils/searchUtils";

interface SearchComponentProps {
    rocrate: any;
    onSelect: (id: string) => void;
    onClose: () => void;
    onFocus: () => void;
    onResults: (results: any[]) => void;
}

export default function SearchComponent({ rocrate, onSelect, onFocus, onResults, onClose }: SearchComponentProps) {
    const [searchText, setSearchText] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setSearchText(text);
        if (text) {
            const matchedResults = searchRoCrate(rocrate, text);
            onResults(matchedResults);
        } else {
            onResults([]);
        }
    };

    const handleClear = () => {
        setSearchText("");
        onResults([]);
        onClose();
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            // Guard against closing immediately when clicking on a search results card
            const isClickOnResults = (event.target as HTMLElement).closest('.search-results-container');
            if (isClickOnResults) {
                return;
            }
            setSearchText("");
            onResults([]);
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={searchRef} className="relative w-full sm:w-80">
            <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">
                    <FaSearch size={14} />
                </span>
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearch}
                    onFocus={onFocus}
                    placeholder="Search entities, properties..."
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#4CAF9C] focus:ring-1 focus:ring-[#4CAF9C] transition-all text-sm"
                />
                {searchText && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        <FaTimes size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
