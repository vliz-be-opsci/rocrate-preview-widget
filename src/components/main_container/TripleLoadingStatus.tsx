import React from "react";

interface TripleLoadingStatusProps {
    fileContent: string;
    mimeType: string;
    loading: boolean;
    paused: boolean;
    loadedTriplesCount: number;
    triplesLength: number;
    onPauseResume: () => void;
    isLoadingComplete: boolean;
}

const TripleLoadingStatus = ({
    fileContent,
    mimeType,
    loading,
    paused,
    loadedTriplesCount,
    triplesLength,
    onPauseResume,
    isLoadingComplete
}: TripleLoadingStatusProps) => {
    return (
        <div className="flex space-x-2 mb-4 items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {new Blob([fileContent]).size} bytes</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                Triples: {loading || paused ? `${loadedTriplesCount} loaded...` : triplesLength}
            </span>
            {(!isLoadingComplete) && (
                <button
                    onClick={onPauseResume}
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
            {isLoadingComplete && (
                <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    All Triples Loaded
                </span>
            )}
        </div>
    );
};

export default TripleLoadingStatus;
