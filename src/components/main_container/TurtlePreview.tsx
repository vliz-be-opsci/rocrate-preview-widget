import React, { useState, useEffect, useRef } from "react";
import { QueryEngine } from '@comunica/query-sparql';
import GraphVis from "../graph/GraphVis";
import TripleTable from "./TripleTable";
import TripleSearch from "./TripleSearch";
import TriplePagination from "./TriplePagination";
import TripleLoadingStatus from "./TripleLoadingStatus";
import TripleError from "./TripleError";

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
    const bindingStreamRef = useRef<any>(null);
    const triplesRef = useRef<any[]>([]);
    const pausedRef = useRef<boolean>(false);
    const resultsPerPage = 20;
    const [relatedSearchTerm, setRelatedSearchTerm] = useState("");
    const [relatedCurrentPage, setRelatedCurrentPage] = useState(1);
    const relatedResultsPerPage = 10;

    const isLoadingComplete = !loading && !paused;

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    useEffect(() => {
        const absoluteFileUrl = new URL(fileUrl, window.location.href).href;
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
                bindingStreamRef.current = result;

                const handleBinding = (binding: any) => {
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
                    if (currentCount % 1000 === 0) {
                        setTriples([...triplesRef.current]);
                    }
                    if (currentCount % 1000 === 0) {
                        setLoadedTriplesCount(currentCount);
                    }
                };

                result.on('data', handleBinding);

                result.on('end', () => {
                    setTriples([...triplesRef.current]);
                    setLoadedTriplesCount(triplesRef.current.length);
                    setLoading(false);
                });

                result.on('error', (err: any) => {
                    setError(err.message);
                    setLoading(false);
                });

            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTriples();

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
        setCurrentPage(1);
    };

    const handleObjectClick = (object: string) => {
        if (object.startsWith('http')) {
            if (object === selectedSubject) {
                const newRelatedSubjects = new Set(relatedSubjects);
                newRelatedSubjects.delete(object);
                if (newRelatedSubjects.size > 0) {
                    const lastSubject = Array.from(newRelatedSubjects).pop();
                    setSelectedSubject(lastSubject || null);
                    setRelatedSubjects(newRelatedSubjects);
                } else {
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

    useEffect(() => {
        if (selectedSubject && relatedSubjects.size > 0) {
            const subjectUris = Array.from(relatedSubjects);
            let query = "SELECT ?subject ?predicate ?object\nWHERE {\n";
            subjectUris.forEach((uri, index) => {
                if (index > 0) {
                    query += "  UNION\n";
                }
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
            const filteredRelatedTriples = relatedTriples.filter(triple =>
                triple.subject.toLowerCase().includes(relatedSearchTerm.toLowerCase()) ||
                triple.predicate.toLowerCase().includes(relatedSearchTerm.toLowerCase()) ||
                triple.object.toLowerCase().includes(relatedSearchTerm.toLowerCase())
            );
            const totalRelatedResults = filteredRelatedTriples.length;
            const totalRelatedPages = Math.ceil(totalRelatedResults / relatedResultsPerPage);
            const displayedRelatedTriples = filteredRelatedTriples.slice(
                (relatedCurrentPage - 1) * relatedResultsPerPage, 
                relatedCurrentPage * relatedResultsPerPage
            );

            return (
                <div>
                    <TripleSearch
                        searchTerm={relatedSearchTerm}
                        onSearchChange={handleRelatedSearchChange}
                        totalResults={totalRelatedResults}
                    />
                    <TripleTable
                        triples={displayedRelatedTriples}
                        onSubjectClick={handleSubjectClick}
                        onObjectClick={handleObjectClick}
                    />
                    <TriplePagination
                        currentPage={relatedCurrentPage}
                        totalPages={totalRelatedPages}
                        onPageChange={setRelatedCurrentPage}
                    />
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
                <TripleSearch
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    totalResults={totalResults}
                />
                <TripleTable
                    triples={displayedTriples}
                    onSubjectClick={handleSubjectClick}
                    onObjectClick={handleObjectClick}
                />
                <TriplePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        );
    };

    if (error) {
        return <TripleError error={error} />;
    }

    return (
        <div>
            <TripleLoadingStatus
                fileContent={fileContent}
                mimeType={mimeType}
                loading={loading}
                paused={paused}
                loadedTriplesCount={loadedTriplesCount}
                triplesLength={triples.length}
                onPauseResume={handlePauseResume}
                isLoadingComplete={isLoadingComplete}
            />
            {renderTriples()}
        </div>
    );
};

export default TurtlePreview;

