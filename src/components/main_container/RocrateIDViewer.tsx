import React, { useState, useEffect } from "react";
import MetadataTable from "./MetadataTable";
import { getFullPath } from "./Breadcrumb";
import { FaDownload, FaTimes, FaInfoCircle } from "react-icons/fa";
import { downloadFileFromCrate } from "../../utils/downloadWithFilename";
import FileContentPreview from "./FileContentPreview";
import SummaryRocrateID from "./SummaryRocrateID";
import ReferencedByList from "./ReferencedByList"; // Import the new component
import { isBinaryFile } from "../../utils/fileTypeUtils";
import { hasType } from "../../utils/rocrateUtils";

interface RocrateIDViewerProps {
    rocrate: any;
    rocrateID: string;
    onSelect: (id: string) => void;
}

const RocrateIDViewer = ({ rocrate, rocrateID, onSelect }: RocrateIDViewerProps) => {
    const [metadataOpen, setMetadataOpen] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(true);
    const [referencedByOpen, setReferencedByOpen] = useState(true); // State for the new accordion
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [binaryContent, setBinaryContent] = useState<ArrayBuffer | null>(null);
    const [mimeType, setMimeType] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);

    console.log("RocrateIDViewer item", item);

    useEffect(() => {
        setError(null); // Reset error state when rocrateID changes
        setBinaryContent(null); // Reset binary content
        setFileContent(null); // Reset text content
        
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
                
                const contentType = response.headers.get("Content-Type");
                setMimeType(contentType);
                setFileUrl(url);
                
                // Determine if this is a binary file
                const filename = url.split('/').pop() || rocrateID.split('/').pop() || '';
                const isBinary = isBinaryFile(contentType || undefined, filename);
                
                if (isBinary) {
                    // Handle as binary file
                    const arrayBuffer = await response.arrayBuffer();
                    setBinaryContent(arrayBuffer);
                    setFileContent(null); // Clear text content for binary files
                } else {
                    // Handle as text file
                    const text = await response.text();
                    setFileContent(text);
                    setBinaryContent(null); // Clear binary content for text files
                }
                
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        //first check if it is really needed to fetch the file content
        if (item["downloadUrl"] !== undefined && item["downloadUrl"] !== null) {
            console.log("Download URL found:", item["downloadUrl"]);
            setLoading(true);
            const downloadURL = item["downloadUrl"];

            if (downloadURL) {
                setInfo("File is available for download at: " + downloadURL);
            } else {
                setError("file is not available for download");
            }
            setLoading(false);
            return;
        }

        if (item && hasType(item, "File")) {
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

        return <MetadataTable data={item} rocrate={rocrate} onSelect={onSelect}/>;
    };

    const renderPreview = () => {
        if (loading) return <p>Loading...</p>;
        if (info) return (
            <div className="card bg-info mb-3">
            <div className="card-body">
                <FaInfoCircle className="card-icon" style={{ color: "#084298" }} />
                <h5 className="card-title" style={{ color: "#084298" }}>Info</h5>
                <p className="card-text" style={{ color: "#084298" }}>{info}</p>
            </div>
            </div>
        );
        if (error) return (
            <div className="card text-white bg-danger mb-3">
                <div className="card-body">
                    <h5 className="card-title">Error</h5>
                    <p className="card-text">{error}</p>
                </div>
            </div>
        );
        if (!fileContent && !binaryContent) return <p>No preview available</p>;

        return (
            <div>
                <FileContentPreview fileContent={fileContent || ""} mimeType={mimeType || "text/plain"} fileUrl={fileUrl || ""} />
            </div>
        );
    };

    const downloadFile = () => {
        const element = document.createElement("a");
        console.log("Download file clicked");
        console.log("item", item);
        // first check if the item has a downloadUrl and use it if available
        if (item && item["downloadUrl"] !== undefined && item["downloadUrl"] !== null) {
            const downloadURL = item["downloadUrl"];
            let filename = downloadURL.split("/").pop() || "";
            if (!filename.includes(".")) {
                const idPart = item["@id"] ? item["@id"].split("/").pop() || "" : "";
                if (idPart.includes(".")) {
                    filename = idPart;
                } else {
                    filename = "download.txt";
                }
            }
            console.log("Download URL found:", downloadURL);
            console.log("Filename:", filename);
            const encodingFormat = item["encodingFormat"] || "text/plain";
            // downloadFileFromCrate(downloadURL, filename, encodingFormat)
            //     .then(() => {
            //         console.log("File downloaded successfully");
            //     })
            //     .catch((error) => {
            //         console.error(`Error downloading file ${filename}:`, error);
            //     });

            // this whole process does not work https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#attributes

            element.href = downloadURL;
            element.download = filename;
            document.body.appendChild(element);
            console.log(element);
            element.click();
            document.body.removeChild(element);
            return;
        }
        // if no downloadUrl is available, use the file content and mimeType to create a Blob
        let file: Blob;
        if (binaryContent) {
            // Create blob from binary content (ArrayBuffer)
            file = new Blob([binaryContent], { type: mimeType || "application/octet-stream" });
        } else {
            // Create blob from text content
            file = new Blob([fileContent || ""], { type: mimeType || "text/plain" });
        }
        element.href = URL.createObjectURL(file);
        element.download = rocrateID.split("/").pop() || "download.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div id="accordion-collapse" data-accordion="collapse">
            {item && (item.description || (hasType(item, "Dataset") && item.hasPart && item.hasPart.some((part: any) => part["@id"].toLowerCase().includes("readme")))) && (
                <>
                    <h2 id="accordion-collapse-heading-summary">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            data-accordion-target="#accordion-collapse-body-summary"
                            aria-expanded={metadataOpen}
                            aria-controls="accordion-collapse-body-summary"
                            onClick={() => setMetadataOpen(!metadataOpen)}
                        >
                            <span>Summary</span>
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
                        id="accordion-collapse-body-summary"
                        className={metadataOpen ? "" : "hidden"}
                        aria-labelledby="accordion-collapse-heading-summary"
                    >
                        <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
                            <SummaryRocrateID rocrate={rocrate} rocrateID={rocrateID} />
                        </div>
                    </div>
                </>
            )}
            {item && (hasType(item, "File") || (hasType(item, "Dataset") && item["downloadUrl"] !== null && item["downloadUrl"] !== undefined)) && (
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
                            <button
                                className="flex items-center justify-center bg-[#4CAF9C] text-white px-3 rounded hover:bg-[#45a089] shadow-md"
                                onClick={downloadFile}
                                title={fileUrl || ""}
                            >
                                <FaDownload className="mr-2" />
                                Download
                            </button>
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
            <h2 id="accordion-collapse-heading-referenced-by">
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                    data-accordion-target="#accordion-collapse-body-referenced-by"
                    aria-expanded={referencedByOpen}
                    aria-controls="accordion-collapse-body-referenced-by"
                    onClick={() => setReferencedByOpen(!referencedByOpen)}
                >
                    <span>Referenced By</span>
                    <svg
                        data-accordion-icon
                        className={`w-3 h-3 ${referencedByOpen ? "rotate-180" : ""} shrink-0`}
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
                id="accordion-collapse-body-referenced-by"
                className={referencedByOpen ? "" : "hidden"}
                aria-labelledby="accordion-collapse-heading-referenced-by"
            >
                <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
                    <ReferencedByList rocrate={rocrate} rocrateID={rocrateID} onSelect={onSelect} />
                </div>
            </div>
        </div>
    );
};

export default RocrateIDViewer;
