import React, { useState, useEffect, useRef } from "react";
import { QueryEngine } from '@comunica/query-sparql';
import GraphVis from "../graph/GraphVis";

interface TurtlePreviewProps {
    fileContent: string;
    mimeType: string;
    fileUrl: string;
}

const TurtlePreview = ({ fileContent, mimeType, fileUrl }: TurtlePreviewProps) => {
    const [triples, setTriples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [relatedSubjects, setRelatedSubjects] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loadedTriplesCount, setLoadedTriplesCount] = useState(0);
    const sigmaRef = useRef<any>(null);
    const bindingStreamRef = useRef<any>(null);
    const triplesRef = useRef<any[]>([]);  // Store triples in a ref for access across effects
    const pausedRef = useRef<boolean>(false);  // Use ref to track paused state for the data handler
    const resultsPerPage = 20;
    const [relatedSearchTerm, setRelatedSearchTerm] = useState("");
    const [relatedCurrentPage, setRelatedCurrentPage] = useState(1);
    const relatedResultsPerPage = 10; // Set to 10 for related triples table
    const [sparqlQuery, setSparqlQuery] = useState<string>("");

    // Function to determine if loading is complete and the button should be hidden
    const isLoadingComplete = !loading && !paused;

    // Keep pausedRef in sync with paused state
    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    useEffect(() => {
        const absoluteFileUrl = new URL(fileUrl, window.location.href).href;
        console.log("Fetching triples from file:", absoluteFileUrl);
        
        // Clear existing triples when loading a new file
        triplesRef.current = [];
        setTriples([]);
        setLoadedTriplesCount(0);
        setLoading(true);
        setPaused(false);
        pausedRef.current = false;
        
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
                bindingStreamRef.current = result;

                // This is a separate function to handle each binding
                // It will be controlled by the paused state
                const handleBinding = (binding: any) => {
                    // Skip if paused
                    if (pausedRef.current) {
                        return;
                    }
                    
                    const newTriple = {
                        subject: binding.get('subject').value,
                        predicate: binding.get('predicate').value,
                        object: binding.get('object').value
                    };
                    
                    triplesRef.current.push(newTriple);
                    const currentCount = triplesRef.current.length;
                    
                    // Update state less frequently to improve performance
                    if (currentCount % 10 === 0) {
                        setTriples([...triplesRef.current]);
                    }
                    
                    if (currentCount % 100 === 0) {
                        setLoadedTriplesCount(currentCount);
                    }
                };

                // Set up data event listener
                result.on('data', handleBinding);

                result.on('end', () => {
                    // Ensure the final state is updated
                    setTriples([...triplesRef.current]);
                    setLoadedTriplesCount(triplesRef.current.length);
                    setLoading(false);
                });
                
                result.on('error', (err: any) => {
                    console.error("Error in binding stream:", err);
                    setError(err.message);
                    setLoading(false);
                });

            } catch (err) {
                console.error("Error fetching triples:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTriples();

        // Cleanup function
        return () => {
            if (bindingStreamRef.current) {
                try {
                    bindingStreamRef.current.destroy();
                } catch (e) {
                    console.error("Error destroying binding stream:", e);
                }
            }
        };
    }, [fileUrl]);

    const handlePauseResume = () => {
        const newPausedState = !paused;
        setPaused(newPausedState);
        pausedRef.current = newPausedState;
        
        // If resuming from pause, ensure the UI shows loading state
        if (!newPausedState && triplesRef.current.length > 0) {
            setLoading(true);
        }
    };

    const fetchRelatedTriples = (subject: string) => {
        if (relatedSubjects.has(subject)) {
            setSelectedSubject(subject);
            return;
        }

        const newRelatedSubjects = new Set(relatedSubjects);
        newRelatedSubjects.add(subject);
        setRelatedSubjects(newRelatedSubjects);
        setSelectedSubject(subject);
    };

    const handleSubjectClick = (subject: string) => {
        fetchRelatedTriples(subject);
        setCurrentPage(1); // Reset to first page when viewing subject details
    };

    const handleObjectClick = (object: string) => {
        // Check if object is a URI (starts with http)
        if (object.startsWith('http')) {
            // If this URI is already selected, deactivate it but keep previous selections
            if (object === selectedSubject) {
                const newRelatedSubjects = new Set(relatedSubjects);
                newRelatedSubjects.delete(object);
                
                // If there are still related subjects, select the latest one
                if (newRelatedSubjects.size > 0) {
                    const lastSubject = Array.from(newRelatedSubjects).pop();
                    setSelectedSubject(lastSubject || null);
                    setRelatedSubjects(newRelatedSubjects);
                } else {
                    // If no subjects remain, go back to main view
                    handleBackToMain();
                }
            } else {
                fetchRelatedTriples(object);
            }
        }
    };

    const handleBackToMain = () => {
        setSelectedSubject(null);
        setRelatedSubjects(new Set());
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleRelatedSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRelatedSearchTerm(e.target.value);
        setRelatedCurrentPage(1);
    };

    // Helper function to shorten labels
    const getShortLabel = (uri: string): string => {
        // For URIs, extract the last part after # or /
        if (uri.startsWith('http')) {
            const parts = uri.split(/[/#]/);
            return parts[parts.length - 1] || uri.substring(0, 20) + "...";
        }
        // For literal values, truncate if too long
        return uri.length > 20 ? uri.substring(0, 20) + "..." : uri;
    };

    useEffect(() => {
        if (selectedSubject && relatedSubjects.size > 0) {
            // Build a SPARQL query to find triples related to selected subjects
            const subjectUris = Array.from(relatedSubjects);
            
            let query = "SELECT ?subject ?predicate ?object\nWHERE {\n";
            
            // Add each subject with a UNION pattern
            subjectUris.forEach((uri, index) => {
                if (index > 0) {
                    query += "  UNION\n";
                }
                // Fixed the string literal - removed the unexpected quote at the end
                query += `  {\n    <${uri}> ?predicate ?object .\n    BIND(<${uri}> AS ?subject)\n  }\n`;
            });
            
            query += "}\n";
            setSparqlQuery(query);
        } else {
            setSparqlQuery("");
        }
    }, [selectedSubject, relatedSubjects]);

    const renderTriples = () => {
        if (selectedSubject) {
            const relatedTriples = triples.filter(triple => 
                relatedSubjects.has(triple.subject) || 
                (triple.object === selectedSubject)
            );
            
            // Filter relatedTriples based on search term
            const filteredRelatedTriples = relatedTriples.filter(triple =>
                triple.subject.toLowerCase().includes(relatedSearchTerm.toLowerCase()) ||
                triple.predicate.toLowerCase().includes(relatedSearchTerm.toLowerCase()) ||
                triple.object.toLowerCase().includes(relatedSearchTerm.toLowerCase())
            );
            
            // Calculate pagination
            const totalRelatedResults = filteredRelatedTriples.length;
            const totalRelatedPages = Math.ceil(totalRelatedResults / relatedResultsPerPage);
            const displayedRelatedTriples = filteredRelatedTriples.slice(
                (relatedCurrentPage - 1) * relatedResultsPerPage, 
                relatedCurrentPage * relatedResultsPerPage
            );
            
            return (
                <div>
                    <div className="flex items-center mb-4">
                        <button 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center mr-3"
                            onClick={handleBackToMain}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to all triples
                        </button>
                        <h5 className="text-lg font-semibold">Triples related to subject:</h5>
                    </div>
                    <div className="bg-gray-100 p-2 mb-4 rounded overflow-auto">
                        <p className="text-sm font-mono">{selectedSubject}</p>
                    </div>
                    
                    <div className="bg-gray-800 text-green-400 p-4 mb-4 rounded font-mono text-sm overflow-auto">
                        <div className="flex justify-between items-center mb-2">
                            <h6 className="text-white font-bold">SPARQL Query:</h6>
                            <button 
                                className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                                onClick={() => navigator.clipboard.writeText(sparqlQuery)}
                                title="Copy to clipboard"
                            >
                                Copy
                            </button>
                        </div>
                        <pre className="whitespace-pre-wrap">{sparqlQuery}</pre>
                    </div>
                    
                    <div className="flex space-x-2 mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Filter related triples..."
                            value={relatedSearchTerm}
                            onChange={handleRelatedSearchChange}
                        />
                        <span className="bg-info text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            Related Results: {totalRelatedResults}
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
                            {displayedRelatedTriples.map((triple, index) => (
                                <tr key={index}>
                                    <td 
                                        className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                        style={{ maxWidth: "300px", cursor: "pointer" }}
                                        title={triple.subject}
                                        onClick={() => handleSubjectClick(triple.subject)}
                                    >
                                        <div className="truncate" style={{ maxWidth: "300px" }}>{triple.subject}</div>
                                    </td>
                                    <td 
                                        className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                        style={{ maxWidth: "300px" }}
                                        title={triple.predicate}
                                    >
                                        <div className="truncate" style={{ maxWidth: "300px" }}>{triple.predicate}</div>
                                    </td>
                                    <td 
                                        className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                                        style={{ maxWidth: "300px", cursor: triple.object.startsWith('http') ? "pointer" : "default" }}
                                        title={triple.object}
                                        onClick={() => triple.object.startsWith('http') && handleObjectClick(triple.object)}
                                    >
                                        <div className="truncate" style={{ maxWidth: "300px" }}>{triple.object}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination for related triples */}
                    <div className="pagination flex items-center space-x-2 mt-4">
                        <button
                            className="btn btn-secondary text-blue-500"
                            onClick={() => setRelatedCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={relatedCurrentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm">
                            Page {relatedCurrentPage} of {totalRelatedPages || 1}
                        </span>
                        <button
                            className="btn btn-secondary text-blue-500"
                            onClick={() => setRelatedCurrentPage(prev => Math.min(prev + 1, totalRelatedPages))}
                            disabled={relatedCurrentPage === totalRelatedPages || totalRelatedPages === 0}
                        >
                            Next
                        </button>
                    </div>
                    
                    {!loading ? (
                        <GraphVis 
                            triples={triples} 
                            selectedSubject={selectedSubject}
                            relatedSubjects={relatedSubjects}
                            onNodeClick={handleObjectClick}
                        />
                    ) : (
                        <div className="mt-6">
                            <div className="bg-blue-100 text-blue-800 p-4 rounded mb-3">
                                <h5 className="font-bold">Graph Visualization Paused</h5>
                                <p>Graph visualization is disabled while triples are loading to prevent performance issues. 
                                   The visualization will be available when all triples have finished loading.</p>
                            </div>
                        </div>
                    )}
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
            <div className="flex space-x-2 mb-4 items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {new Blob([fileContent]).size} bytes</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    Triples: {loading || paused ? `${loadedTriplesCount} loaded...` : triples.length}
                </span>
                
                {/* Only show pause/resume button while loading or paused */}
                {(!isLoadingComplete) && (
                    <button
                        onClick={handlePauseResume}
                        className={`ml-auto px-3 rounded text-white ${paused ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {paused ? (
                            <span className="flex items-center text-xs py-0.5 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                                Resume Loading
                            </span>
                        ) : (
                            <span className="flex items-center text-xs py-0.5 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pause Loading
                            </span>
                        )}
                    </button>
                )}
                
                {/* Show completion status when loading is complete */}
                {isLoadingComplete && (
                    <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All Triples Loaded
                    </span>
                )}
            </div>
            
            {loading && !paused && (
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-3">
                    <h5 className="font-bold">Loading</h5>
                    <p>The TTL file is being loaded and processed in the triplestore...</p>
                </div>
            )}
            
            {paused && (
                <div className="bg-orange-100 text-orange-800 p-4 rounded mb-3">
                    <h5 className="font-bold">Loading Paused</h5>
                    <p>Triple loading has been paused. Click 'Resume Loading' to continue fetching triples from the file.</p>
                </div>
            )}
            
            {renderTriples()}
        </div>
    );
};

export default TurtlePreview;

