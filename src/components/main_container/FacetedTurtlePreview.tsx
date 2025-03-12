import React, { useState, useEffect, useRef } from "react";
import { QueryEngine } from '@comunica/query-sparql';
import { Store, DataFactory } from 'n3';
import TripleTable from "./TripleTable";
import TriplePagination from "./TriplePagination";
import TripleLoadingStatus from "./TripleLoadingStatus";
import TripleError from "./TripleError";
import { fetchFacetValues } from '../../utils/rocrateUtils';

interface FacetedTurtlePreviewProps {
    fileContent: string;
    mimeType: string;
    fileUrl: string;
}

const FacetedTurtlePreview = ({ fileContent, mimeType, fileUrl }: FacetedTurtlePreviewProps) => {
    const [triples, setTriples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loadedTriplesCount, setLoadedTriplesCount] = useState(0);
    const [facets, setFacets] = useState<any[]>([]);
    const [openFacetIndex, setOpenFacetIndex] = useState<number | null>(null);
    const [items, setItems] = useState<string[]>([]);
    const bindingStreamRef = useRef<any>(null);
    const triplesRef = useRef<any[]>([]);
    const pausedRef = useRef<boolean>(false);
    const storeRef = useRef<Store>(new Store());
    const resultsPerPage = 20;

    const isLoadingComplete = !loading && !paused;

    useEffect(() => {
        const absoluteFileUrl = new URL(fileUrl, window.location.href).href;
        triplesRef.current = [];
        setTriples([]);
        setLoadedTriplesCount(0);
        setLoading(true);
        setPaused(false);
        pausedRef.current = false;

        const fetchTriples = async () => {
            console.log("Fetching triples...");
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

                const handleBinding = async (binding: any) => {
                    if (pausedRef.current) {
                        return;
                    }
                    const newTriple = {
                        subject: binding.get('subject').value,
                        predicate: binding.get('predicate').value,
                        object: binding.get('object').value
                    };
                    triplesRef.current.push(newTriple);
                    storeRef.current.addQuad(
                        DataFactory.namedNode(newTriple.subject),
                        DataFactory.namedNode(newTriple.predicate),
                        DataFactory.namedNode(newTriple.object)
                    );
                    const currentCount = triplesRef.current.length;
                    if (currentCount % 10000 === 0) {
                        await fetchFacets();
                    }
                    if (currentCount % 1000 === 0) {
                        setTriples([...triplesRef.current]);
                    }
                    if (currentCount % 100 === 0) {
                        setLoadedTriplesCount(currentCount);
                    }
                };

                result.on('data', handleBinding);

                result.on('end', async () => {
                    setTriples([...triplesRef.current]);
                    setLoadedTriplesCount(triplesRef.current.length);
                    setLoading(false);
                    await fetchFacets();
                });

                result.on('error', (err: unknown) => {
                    setError((err as any).message);
                    setLoading(false);
                });

            } catch (err: unknown) {
                setError((err as any).message);
                setLoading(false);
            }
        };

        const fetchFacets = async () => {
            console.log("Fetching facets...");
            console.log("Store size:", storeRef.current.size);
            const engine = new QueryEngine();
            const query = `
                SELECT ?predicate (COUNT(DISTINCT ?object) AS ?valueCount)
                WHERE {
                    ?subject ?predicate ?object.
                }
                GROUP BY ?predicate
                ORDER BY DESC(?valueCount)
            `;
            try {
                const result = await engine.queryBindings(query, {
                    sources: [{ type: 'rdfjsSource', value: storeRef.current }]
                });
                console.log("Facets result:", result);

                const facetsData: any[] = [];
                result.on('data', (binding: any) => {
                    console.log("Facets binding:", binding);
                    console.log("Facets valueCount:", binding.get('valueCount'));
                    console.log("Facets predicate:", binding.get('predicate'));
                    console.log(binding);
                    facetsData.push({
                        predicate: binding.get('predicate').value,
                        valueCount: binding.get('valueCount').value
                    });
                    setFacets(facetsData);
                });

                result.on('end', () => {
                    console.log("Facets data:", facetsData);
                    setFacets(facetsData);
                });

                result.on('error', (err: unknown) => {
                    setError((err as any).message);
                    console.error("Error fetching facets:", err);
                });

            } catch (err: unknown) {
                setError((err as any).message);
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

    const renderTriples = () => {
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
                <TripleTable 
                    triples={displayedTriples} 
                    onSubjectClick={() => {}} 
                    onObjectClick={() => {}} 
                />
                <TriplePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        );
    };

    const renderFacets = () => {
        const filteredFacets = facets.filter(facet => facet.valueCount >= 2 && facet.valueCount <= 10);
        return (
            <div>
                <h3 className="text-lg font-semibold mb-4">Facets</h3>
                <div className="grid grid-cols-4 gap-4">
                    {filteredFacets.map((facet, index) => {
                        const predicateParts = facet.predicate.split(/[#\/]/);
                        const predicateText = predicateParts[predicateParts.length - 1];

                        return (
                            <div key={index} className="flex flex-col items-center">
                                <button
                                    className="bg-blue-500 text-white py-2 px-4 rounded w-full"
                                    onClick={async () => {
                                        if (openFacetIndex === index) {
                                            setOpenFacetIndex(null);
                                        } else {
                                            setOpenFacetIndex(index);
                                            const values = await fetchFacetValues(storeRef.current, facet.predicate);
                                            setItems(values);
                                        }
                                    }}
                                >
                                    <span role="img" aria-label="tabular icon">📊</span> {predicateText} ({facet.valueCount})
                                </button>
                                {openFacetIndex === index && (
                                    <ul className="mt-2 bg-gray-100 p-2 rounded shadow-lg w-full">
                                        {items.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
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
                isLoadingComplete={isLoadingComplete}
                onPauseResume={() => setPaused(!paused)}
            />
            {renderFacets()}
            {renderTriples()}
        </div>
    );
};

export default FacetedTurtlePreview;
