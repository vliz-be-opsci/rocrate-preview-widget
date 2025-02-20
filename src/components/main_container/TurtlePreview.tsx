import React, { useState, useEffect } from "react";
import * as rdflib from "rdflib";

interface TurtlePreviewProps {
    fileContent: string;
    mimeType: string;
}

const TurtlePreview = ({ fileContent, mimeType }: TurtlePreviewProps) => {
    const [store, setStore] = useState(new rdflib.Store());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [triples, setTriples] = useState<rdflib.Statement[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 20;

    useEffect(() => {
        const store = new rdflib.Store();
        rdflib.parse(fileContent, store, "http://example.org/base#", "text/turtle", (err) => {
            if (err) {
                setError(err.message);
            } else {
                setStore(store);
                setTriples(store.statements);
            }
            setLoading(false);
        });
    }, [fileContent]);

    const handleSubjectClick = (subject: string) => {
        setSelectedSubject(subject);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const renderTriples = () => {
        if (selectedSubject) {
            const relatedTriples = triples.filter(triple => triple.subject.value === selectedSubject);
            return (
                <div>
                    <h5>Triples related to {selectedSubject}</h5>
                    <ul>
                        {relatedTriples.map((triple, index) => (
                            <li key={index}>
                                {triple.subject.value} - {triple.predicate.value} - {triple.object.value}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        const filteredTriples = triples.filter(triple =>
            triple.subject.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
            triple.predicate.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
            triple.object.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const totalResults = filteredTriples.length;
        const totalPages = Math.ceil(totalResults / resultsPerPage);
        const displayedTriples = filteredTriples.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

        return (
            <div>
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search subjects, predicates, or objects..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <span className="bg-info text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Results: {totalResults}
                    </span>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#4CAF9C]">
                        <tr>
                            <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Predicate</th>
                            <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Object</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayedTriples.map((triple, index) => (
                            <tr key={index} onClick={() => handleSubjectClick(triple.subject.value)}>
                                <td 
                                    className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                    style={{ maxWidth: "300px", cursor: "pointer" }}
                                    title={triple.subject.value}
                                >
                                    <div className="truncate" style={{ maxWidth: "300px" }}>{triple.subject.value}</div>
                                </td>
                                <td 
                                    className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                    style={{ maxWidth: "300px", cursor: "pointer" }}
                                    title={triple.predicate.value}
                                >
                                    <div className="truncate" style={{ maxWidth: "300px" }}>{triple.predicate.value}</div>
                                </td>
                                <td 
                                    className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                    style={{ maxWidth: "300px", cursor: "pointer" }}
                                    title={triple.object.value}
                                >
                                    <div className="truncate" style={{ maxWidth: "300px" }}>{triple.object.value}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination flex items-center space-x-2 mt-4">
                    <button
                        className="btn btn-secondary text-blue-500"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                            setCurrentPage(page);
                        }}
                    />
                    <button
                        className="btn btn-secondary text-blue-500"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="card text-white bg-danger mb-3">
                <div className="card-body">
                    <h5 className="card-title">Error</h5>
                    <p className="card-text">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {new Blob([fileContent]).size} bytes</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Triples: {loading ? "Loading..." : store.length}
                </span>
            </div>
            {renderTriples()}
        </div>
    );
};

export default TurtlePreview;
