import React from "react";

interface TripleErrorProps {
    error: string;
}

const TripleError = ({ error }: TripleErrorProps) => {
    return (
        <div className="bg-red-500 text-white p-4 rounded mb-3">
            <h5 className="font-bold">Error</h5>
            <p>{error}</p>
        </div>
    );
};

export default TripleError;
