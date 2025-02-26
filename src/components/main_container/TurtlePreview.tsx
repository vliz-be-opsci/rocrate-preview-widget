import React, { useState, useEffect, useRef } from "react";
import { QueryEngine } from '@comunica/query-sparql';
import Sigma from "sigma";
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-forceatlas2/worker";

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
    const [relatedSubjects, setRelatedSubjects] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loadedTriplesCount, setLoadedTriplesCount] = useState(0);
    const sigmaRef = useRef<any>(null);
    const graphContainerRef = useRef<HTMLDivElement>(null);
    const graphInstanceRef = useRef<any>(null);
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
            fetchRelatedTriples(object);
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

    // Create and render graph visualization
    useEffect(() => {
        if (selectedSubject && graphContainerRef.current && !loading) {
            // Only render the graph when triples are fully loaded
            // Clear any existing graph
            if (graphInstanceRef.current) {
                graphInstanceRef.current.kill();
                graphInstanceRef.current = null;
            }
            
            // Get related triples for the selected subject
            const relatedTriples = triples.filter(triple => 
                relatedSubjects.has(triple.subject) || 
                (triple.object.startsWith('http') && relatedSubjects.has(triple.object))
            );
            
            if (relatedTriples.length === 0) return;
            
            // Create a new graph
            const graph = new Graph();
            
            // Add nodes and edges
            const nodeMap = new Map();
            
            // Add all subjects and objects as nodes with random positions
            relatedTriples.forEach(triple => {
                if (!nodeMap.has(triple.subject)) {
                    nodeMap.set(triple.subject, {
                        id: triple.subject,
                        label: getShortLabel(triple.subject),
                        size: 10,
                        x: Math.random(),  // Random x position
                        y: Math.random(),  // Random y position
                        color: triple.subject === selectedSubject ? "#FF5733" : "#6c757d"
                    });
                }
                
                if (triple.object.startsWith('http') && !nodeMap.has(triple.object)) {
                    nodeMap.set(triple.object, {
                        id: triple.object,
                        label: getShortLabel(triple.object),
                        size: 8,
                        x: Math.random(),  // Random x position
                        y: Math.random(),  // Random y position
                        color: triple.object === selectedSubject ? "#FF5733" : "#9c27b0"
                    });
                }
            });
            
            // Add nodes to graph
            nodeMap.forEach((nodeData, nodeId) => {
                graph.addNode(nodeId, nodeData);
            });
            
            // Add edges between nodes
            relatedTriples.forEach((triple, index) => {
                if (triple.object.startsWith('http') && graph.hasNode(triple.object)) {
                    try {
                        graph.addEdge(triple.subject, triple.object, {
                            id: `e${index}`,
                            label: getShortLabel(triple.predicate),
                            size: 1,
                            color: "#ccc"
                        });
                    } catch (error) {
                        console.error("Error adding edge:", error);
                    }
                }
            });
            
            try {
                // Create sigma instance
                const container = graphContainerRef.current;
                container.innerHTML = "";
                
                const renderer = new Sigma(graph, container, {
                    minCameraRatio: 0.1,
                    maxCameraRatio: 10,
                    renderLabels: true,
                    renderEdgeLabels: false,
                    labelFont: "Arial",
                    labelSize: 12,
                    labelWeight: "normal"
                });
                
                // Start force layout
                const layout = new ForceSupervisor(graph, {
                    settings: {
                        gravity: 1,
                        adjustSizes: true,
                        linLogMode: true,
                        outboundAttractionDistribution: true,
                        barnesHutOptimize: true,
                        slowDown: 10
                    }
                });
                
                layout.start();
                setTimeout(() => layout.stop(), 3000); // Run layout for 3 seconds
                
                // Add node click event
                renderer.on("clickNode", ({ node }) => {
                    handleObjectClick(node);
                });
                
                graphInstanceRef.current = {
                    graph,
                    renderer,
                    layout,
                    kill: () => {
                        layout.stop();
                        renderer.kill();
                    }
                };
            } catch (error) {
                console.error("Error initializing sigma:", error);
            }
        }
    }, [selectedSubject, relatedSubjects, triples, loading]);

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

    const renderTriples = () => {
        if (selectedSubject) {
            const relatedTriples = triples.filter(triple => 
                relatedSubjects.has(triple.subject) || 
                (triple.object === selectedSubject)
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
                    
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#4CAF9C]">
                            <tr>
                                <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Predicate</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Object</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {relatedTriples.map((triple, index) => (
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
                    
                    {!loading ? (
                        <div className="mt-6">
                            <h5 className="text-lg font-semibold mb-2">Graph Visualization</h5>
                            <div 
                                ref={graphContainerRef} 
                                className="border border-gray-300 rounded-md"
                                style={{ height: "400px", width: "100%" }}
                            ></div>
                            <p className="text-sm text-gray-500 mt-2">
                                Click on nodes to explore relationships. Red node is the currently selected subject.
                            </p>
                        </div>
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

