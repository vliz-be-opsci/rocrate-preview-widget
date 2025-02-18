import React, { useState, useEffect } from "react";
import MetadataTable from "./MetadataTable";
import { getFullPath } from "./Breadcrumb";
import { FaDownload, FaTimes } from "react-icons/fa";
import FileContentPreview from "./FileContentPreview";
import SummaryRocrateID from "./SummaryRocrateID";

interface RocrateIDViewerProps {
    rocrate: any;
    rocrateID: string;
    onSelect: (id: string) => void;
}

const RocrateIDViewer = ({ rocrate, rocrateID, onSelect }: RocrateIDViewerProps) => {
    const [metadataOpen, setMetadataOpen] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(true);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);

    useEffect(() => {
        setError(null); // Reset error state when rocrateID changes

        const fetchFileContent = async (url: string, rocrateidsearch:boolean) => {
            try {
                const response = await fetch(url);
                if (response.status === 304) {
                    // Handle 304 Not Modified by using cached content if available
                    setLoading(false);
                    return;
                }
                if (!response.ok) {
                    if (rocrateidsearch){
                        throw new Error("File not found");
                        return;
                    }
                    fetchFileContent(rocrateID, true);
                    return;
                }
                const text = await response.text();
                setFileContent(text);
                setMimeType(response.headers.get("Content-Type"));
                setFileUrl(url);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (item && item["@type"] === "File") {
            setLoading(true);
            const fullPath = getFullPath(rocrate, rocrateID);
            console.log(fullPath);
            if (fullPath) {
                fetchFileContent(fullPath, false).catch(() => {
                    // If fetching by full path fails, try fetching by rocrateID
                    fetchFileContent(rocrateID, true);
                });
            } else {
                fetchFileContent(rocrateID, true);
            }
        }
    }, [rocrateID, item]);

    const renderMetadata = () => {
        if (!item) return <p>No metadata available</p>;

        return <MetadataTable data={item} onSelect={onSelect} />;
    };

    const renderPreview = () => {
        if (loading) return <p>Loading...</p>;
        if (error) return (
            <div className="card text-white bg-danger mb-3">
                <div className="card-body">
                    <h5 className="card-title">Error</h5>
                    <p className="card-text">{error}</p>
                </div>
            </div>
        );
        if (!fileContent) return <p>No preview available</p>;

        return (
            <div>
                <button
                    className="mt-2 mb-4 flex items-center justify-center bg-[#4CAF9C] text-white py-1 px-3 rounded-full hover:bg-[#45a089] shadow-md"
                    onClick={downloadFile}
                >
                    <FaDownload className="mr-2" />
                    Download
                </button>
                <FileContentPreview fileContent={fileContent} mimeType={mimeType || "text/plain"} fileUrl={fileUrl || ""} />
                
            </div>
        );
    };

    const downloadFile = () => {
        const element = document.createElement("a");
        const file = new Blob([fileContent || ""], { type: mimeType || "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = rocrateID.split("/").pop() || "download.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div id="accordion-collapse" data-accordion="collapse">
            <SummaryRocrateID rocrate={rocrate} rocrateID={rocrateID} />
            {item && item["@type"] === "File" && (
                <>
                    <h2 id="accordion-collapse-heading-2">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            data-accordion-target="#accordion-collapse-body-2"
                            aria-expanded={previewOpen}
                            aria-controls="accordion-collapse-body-2"
                            onClick={() => setPreviewOpen(!previewOpen)}
                        >
                            <span>Content</span>
                            <svg
                                data-accordion-icon
                                className={`w-3 h-3 ${previewOpen ? "rotate-180" : ""} shrink-0`}
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
                        className={previewOpen ? "" : "hidden"}
                        aria-labelledby="accordion-collapse-heading-2"
                    >
                        <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
                            {renderPreview()}
                        </div>
                    </div>
                </>
            )}
            <h2 id="accordion-collapse-heading-1">
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-md focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                    data-accordion-target="#accordion-collapse-body-1"
                    aria-expanded={metadataOpen}
                    aria-controls="accordion-collapse-body-1"
                    onClick={() => setMetadataOpen(!metadataOpen)}
                >
                    <span>Info</span>
                    <svg
                        data-accordion-icon
                        className={`w-3 h-3 ${metadataOpen ? "rotate-180" : ""} shrink-0`}
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
                className={metadataOpen ? "" : "hidden"}
                aria-labelledby="accordion-collapse-heading-1"
            >
                <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                    {renderMetadata()}
                </div>
            </div>
        </div>
    );
};

export default RocrateIDViewer;
