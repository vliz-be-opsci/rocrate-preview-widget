import React from "react";

interface TripleSearchProps {
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    totalResults: number;
}

const TripleSearch = ({ searchTerm, onSearchChange, totalResults }: TripleSearchProps) => {
    return (
        <div className="flex space-x-2 mb-4">
            <input
                type="text"
                className="form-control"
                placeholder="Search subjects, predicates, or objects..."
                value={searchTerm}
                onChange={onSearchChange}
            />
            <span className="bg-info text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                Results: {totalResults}
            </span>
        </div>
    );
};

export default TripleSearch;
