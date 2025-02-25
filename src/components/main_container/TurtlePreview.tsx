import React, { useState, useEffect } from "react";
import { QueryEngine } from '@comunica/query-sparql';

interface TurtlePreviewProps {
    fileContent: string;
    mimeType: string;
    fileUrl: string;
}

const TurtlePreview = ({ fileContent, mimeType, fileUrl }: TurtlePreviewProps) => {
    const [triples, setTriples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loadedTriplesCount, setLoadedTriplesCount] = useState(0);
    const resultsPerPage = 20;

    useEffect(() => {
        const absoluteFileUrl = new URL(fileUrl, window.location.href).href;
        console.log("Fetching triples from file:", absoluteFileUrl);
        const fetchTriples = async () => {
            const engine = new QueryEngine();
            const query = `
                SELECT ?subject ?predicate ?object
                WHERE {
                    ?subject ?predicate ?object.
                }
            `;
            try {
                const result = await engine.queryBindings(query, {
                    sources: [absoluteFileUrl]
                });
                console.log("Query result:", result);
                const triples: any[] = [];
                let count = 0;
                result.on('data', (binding: any) => {
                    triples.push({
                        subject: binding.get('subject').value,
                        predicate: binding.get('predicate').value,
                        object: binding.get('object').value
                    });
                    count++;
                    setTriples([...triples]); // Update state with new triples
                    if (count % 100 === 0) {
                        setLoadedTriplesCount(count);
                    }
                });
                result.on('end', () => {
                    setLoading(false);
                    setLoadedTriplesCount(triples.length);
                });
            } catch (err) {
                console.error("Error fetching triples:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTriples();
    }, [fileUrl]);

    const handleSubjectClick = (subject: string) => {
        setSelectedSubject(subject);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const renderTriples = () => {
        if (selectedSubject) {
            const relatedTriples = triples.filter(triple => triple.subject === selectedSubject);
            return (
                <div>
                    <h5>Triples related to {selectedSubject}</h5>
                    <ul>
                        {relatedTriples.map((triple, index) => (
                            <li key={index}>
                                {triple.subject} - {triple.predicate} - {triple.object}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        const filteredTriples = triples.filter(triple =>
            triple.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            triple.predicate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            triple.object.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <tr key={index} onClick={() => handleSubjectClick(triple.subject)}>
                                <td 
                                    className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                    style={{ maxWidth: "300px", cursor: "pointer" }}
                                    title={triple.subject}
                                >
                                    <div className="truncate" style={{ maxWidth: "300px" }}>{triple.subject}</div>
                                </td>
                                <td 
                                    className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                    style={{ maxWidth: "300px", cursor: "pointer" }}
                                    title={triple.predicate}
                                >
                                    <div className="truncate" style={{ maxWidth: "300px" }}>{triple.predicate}</div>
                                </td>
                                <td 
                                    className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                    style={{ maxWidth: "300px", cursor: "pointer" }}
                                    title={triple.object}
                                >
                                    <div className="truncate" style={{ maxWidth: "300px" }}>{triple.object}</div>
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
            <div className="bg-red-500 text-white p-4 rounded mb-3">
                <h5 className="font-bold">Error</h5>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {new Blob([fileContent]).size} bytes</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Triples: {loading ? `${loadedTriplesCount} loaded...` : triples.length}
                </span>
            </div>
            {loading && (
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-3">
                    <h5 className="font-bold">Loading</h5>
                    <p>The TTL file is being loaded and processed in the triplestore...</p>
                </div>
            )}
            {renderTriples()}
        </div>
    );
};

export default TurtlePreview;

