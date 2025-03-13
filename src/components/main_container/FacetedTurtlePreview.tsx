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
    const [predicateTexts, setPredicateTexts] = useState<{ [key: string]: string }>({});
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

const fetchPrefix = async (facet: string) => {
    try {
        const response = await fetch(`https://prefix.cc/?q=${facet}`, { method: 'HEAD', redirect: 'follow' });
        const redirectedUrl = response.url;
        console.log('Redirected URL:', redirectedUrl);
        const prefix = redirectedUrl.split('/').pop() || facet;
        if (!prefix.includes(":")) {
            return facet;
        }

        return prefix;
    } catch (error) {
        console.error('Error fetching prefix:', error);
        return facet;
    }
};

    useEffect(() => {
        const fetchAndSetPrefixes = async () => {
            const newPredicateTexts: { [key: string]: string } = {};
            for (const facet of facets) {
                const prefix = await fetchPrefix(facet.predicate);
                newPredicateTexts[facet.predicate] = prefix;
            }
            setPredicateTexts(newPredicateTexts);
        };
        fetchAndSetPrefixes();
    }, [facets]);

const [selectedOptions, setSelectedOptions] = useState<{ [facet: string]: string[] }>({});

const handleCheckboxChange = (facet: string, option: string) => {
    setSelectedOptions(prevState => {
        const newOptions = { ...prevState };
        if (!newOptions[facet]) {
            newOptions[facet] = [];
        }
        if (newOptions[facet].includes(option)) {
            newOptions[facet] = newOptions[facet].filter(opt => opt !== option);
        } else {
            newOptions[facet].push(option);
        }
        return newOptions;
    });
};

const renderFacets = () => {
    const filteredFacets = facets.filter(facet => facet.valueCount >= 2 && facet.valueCount <= 20);
    return (
        <>
        <div style={{ display: 'flex', flexDirection: 'column' }} className="mb-4">
            <h3 className="text-lg font-semibold mb-4">Facets</h3>
            <div className="grid grid-cols-10 gap-4 h-full">
                <div className="col-span-4 flex flex-col justify-between">
                    <div className="border p-2" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
                        {filteredFacets.map((facet, index) => {
                            const predicateText = predicateTexts[facet.predicate] || facet.predicate;

                            return (
                                <div key={index} className="flex flex-col items-center my-2">
                                    <button
                                        className={`py-2 px-4 rounded w-full ${openFacetIndex === index ? 'bg-blue-700' : 'bg-blue-500'} text-white`}
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
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="col-span-4 relative border p-2" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
                    {openFacetIndex !== null && (
                        <div className="bg-gray-100 p-2 rounded shadow-lg w-full">
                            <button
                                className="absolute top-0 right-0 mt-2 mr-2 text-red-500"
                                onClick={() => setOpenFacetIndex(null)}
                            >
                                X
                            </button>
                            <ul>
                                {items.map((item, index) => {
                                    const isChecked = selectedOptions[facets[openFacetIndex].predicate]?.includes(item) || false;
                                    return (
                                        <div key={index} className="facet-option">
                                            <input
                                                type="checkbox"
                                                id={`${facets[openFacetIndex].predicate}-${item}`}
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(facets[openFacetIndex].predicate, item)}
                                            />
                                            <label htmlFor={`${facets[openFacetIndex].predicate}-${item}`}>{item}</label>
                                        </div>
                                    );
                                })}
                            </ul>
                </div>
                    )}
                </div>
            </div>
        </div>
        <div className="col-span-2 flex flex-col justify-between border p-2" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
            <h3 className="text-lg font-semibold mb-4">Selected Options</h3>
            <>
                <ul>
                    {Object.keys(selectedOptions).map(facet => (
                        selectedOptions[facet].map(option => (
                            <li key={`${facet}-${option}`}>{facet}: {option}</li>
                        ))
                    ))}
                </ul>
            </>
            <button className="sticky bottom-0 bg-blue-500 text-white py-2 px-4 rounded w-full mt-2">
                <span role="img" aria-label="search icon">🔍</span> Search
            </button>
        </div>
        </>
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
