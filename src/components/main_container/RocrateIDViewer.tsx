import React, { useState, useEffect } from "react";
import MetadataTable from "./MetadataTable";
import { getFullPath } from "./Breadcrumb";

interface RocrateIDViewerProps {
    rocrate: any;
    rocrateID: string;
    onSelect: (id: string) => void;
}

const RocrateIDViewer = ({ rocrate, rocrateID, onSelect }: RocrateIDViewerProps) => {
    const [activeTab, setActiveTab] = useState("metadata");
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);

    useEffect(() => {
        const fetchFileContent = async (url: string) => {
            try {
                const response = await fetch(url);
                if (response.status === 304) {
                    // Handle 304 Not Modified by using cached content if available
                    setLoading(false);
                    return;
                }
                if (!response.ok) {
                    throw new Error("File not found");
                }
                const text = await response.text();
                setFileContent(text);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (activeTab === "preview" && item && item["@type"] === "File") {
            setLoading(true);
            const fullPath = getFullPath(rocrate, rocrateID);
            console.log(fullPath);
            if (fullPath) {
                fetchFileContent(fullPath).catch(() => {
                    // If fetching by full path fails, try fetching by rocrateID
                    fetchFileContent(rocrateID);
                });
            } else {
                fetchFileContent(rocrateID);
            }
        }
    }, [activeTab, rocrateID, item]);

    const renderMetadata = () => {
        if (!item) return <p>No metadata available</p>;

        return <MetadataTable data={item} onSelect={onSelect} />;
    };

    const renderPreview = () => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>{error}</p>;
        if (!fileContent) return <p>No preview available</p>;

        return <pre className="bg-gray-100 p-4">{fileContent}</pre>;
    };

    return (
        <div id="accordion-collapse" data-accordion="collapse">
            <h2 id="accordion-collapse-heading-1">
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                    data-accordion-target="#accordion-collapse-body-1"
                    aria-expanded={activeTab === "metadata"}
                    aria-controls="accordion-collapse-body-1"
                    onClick={() => setActiveTab("metadata")}
                >
                    <span>Metadata</span>
                    <svg
                        data-accordion-icon
                        className={`w-3 h-3 ${activeTab === "metadata" ? "rotate-180" : ""} shrink-0`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5 5 1 1 5"
                        />
                    </svg>
                </button>
            </h2>
            <div
                id="accordion-collapse-body-1"
                className={activeTab === "metadata" ? "" : "hidden"}
                aria-labelledby="accordion-collapse-heading-1"
            >
                <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                    {renderMetadata()}
                </div>
            </div>
            {item && item["@type"] === "File" && (
                <>
                    <h2 id="accordion-collapse-heading-2">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            data-accordion-target="#accordion-collapse-body-2"
                            aria-expanded={activeTab === "preview"}
                            aria-controls="accordion-collapse-body-2"
                            onClick={() => setActiveTab("preview")}
                        >
                            <span>Preview File</span>
                            <svg
                                data-accordion-icon
                                className={`w-3 h-3 ${activeTab === "preview" ? "rotate-180" : ""} shrink-0`}
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 10 6"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5 5 1 1 5"
                                />
                            </svg>
                        </button>
                    </h2>
                    <div
                        id="accordion-collapse-body-2"
                        className={activeTab === "preview" ? "" : "hidden"}
                        aria-labelledby="accordion-collapse-heading-2"
                    >
                        <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
                            {renderPreview()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RocrateIDViewer;
