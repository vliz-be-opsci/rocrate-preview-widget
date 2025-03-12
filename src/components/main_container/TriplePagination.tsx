import React from "react";

interface TriplePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const TriplePagination = ({ currentPage, totalPages, onPageChange }: TriplePaginationProps) => {
    return (
        <div className="pagination flex items-center space-x-2 mt-4">
            <button
                className="btn btn-secondary text-blue-500"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <input
                type="number"
                className="form-control w-16 text-center"
                value={currentPage}
                onChange={(e) => {
                    const page = Math.min(Math.max(Number(e.target.value), 1), totalPages);
                    onPageChange(page);
                }}
            />
            <button
                className="btn btn-secondary text-blue-500"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default TriplePagination;
