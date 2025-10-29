import React, { useState, useEffect } from "react";
import TabularData from "./TabularData";
import CodePreview from "./CodePreview";
import ImagePreview from "./ImagePreview";
import PdfPreview from "./PdfPreview";
import AudioPreview from "./AudioPreview";
import FacetedTurtlePreview from "./FacetedTurtlePreview"; // Updated import
import { FaExclamationTriangle } from "react-icons/fa";
import { isBinaryFile, isExcelFile } from "../../utils/fileTypeUtils";

interface FileContentPreviewProps {
    fileContent: string;
    mimeType: string;
    fileUrl: string;
}

export const FileContentPreview = ({ fileContent, mimeType, fileUrl }: FileContentPreviewProps) => {
    const [content, setContent] = useState(fileContent);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFileContent = async (url: string, fallback: boolean) => {
            try {
                const response = await fetch(url);
                if (response.status === 304) {
                    setLoading(false);
                    return;
                }
                if (!response.ok) {
                    if (fallback) {
                        throw new Error("File not found");
                    }
                    fetchFileContent(fileUrl, true);
                    return;
                }
                const text = await response.text();
                setContent(text);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (!fileContent) {
            setLoading(true);
            fetchFileContent(fileUrl, false);
        }
    }, [fileContent, fileUrl]);

    const fileSize = new Blob([content]).size;
    const fileName = fileUrl.split('/').pop() || "";

    const renderContent = () => {
        if (loading) return <p>Loading...</p>;
        if (error) return (
            <div className="card text-white bg-danger mb-3">
                <div className="card-body">
                    <h5 className="card-title">Error</h5>
                    <p className="card-text">{error}</p>
                </div>
            </div>
        );

        const isCsv = mimeType.startsWith("text/csv") || mimeType.startsWith("application/vnd.ms-excel");
        const isExcel = isExcelFile(mimeType);
        const isBinary = isBinaryFile(mimeType, fileName);
        
        // Handle Excel files specifically
        if (isExcel) {
            return (
                <div>
                    <div className="flex space-x-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Excel Spreadsheet</span>
                    </div>
                    <div className="bg-blue-50 text-blue-700 p-4 rounded mb-3 border border-blue-200">
                        <div className="flex items-center">
                            <div>
                                <p className="text-blue-700">🗂️ This is an Excel spreadsheet file (.xlsx/.xls).</p>
                                <p className="text-blue-700">Use the download button to save and open it in Microsoft Excel, LibreOffice Calc, or Google Sheets.</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        if (isCsv) {
            return <TabularData fileContent={content} mimeType={mimeType} />;
        }
        
        if (mimeType.startsWith("text/turtle")) {
            return <FacetedTurtlePreview fileContent={content} mimeType={mimeType} fileUrl={fileUrl}/>; // Updated component
        }
        

        if (mimeType.startsWith("text/")) {
            return <CodePreview fileContent={content} mimeType={mimeType} fileName={fileName} />;
        }

        if (mimeType.startsWith("image/")) {
            return <ImagePreview fileUrl={fileUrl} mimeType={mimeType} />;
        }

        if (mimeType === "application/pdf") {
            return <PdfPreview fileUrl={fileUrl} />;
        }

        if (mimeType.startsWith("audio/")) {
            return <AudioPreview fileUrl={fileUrl} fileSize={fileSize} mimeType={mimeType} />;
        }

        // Handle other binary files that we don't have specific viewers for
        if (isBinary && !mimeType.startsWith("image/") && mimeType !== "application/pdf") {
            return (
                <div>
                    <div className="flex space-x-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Binary File</span>
                    </div>
                    <div className="bg-purple-50 text-purple-700 p-4 rounded mb-3 border border-purple-200">
                        <div className="flex items-center">
                            <div>
                                <p className="text-purple-700">📁 This is a binary file that cannot be previewed as text.</p>
                                <p className="text-purple-700">Use the download button to save the file to your device.</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        switch (mimeType) {
            default:
                return (
                    <div>
                        <div className="flex space-x-2 mb-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                        </div>
                        <div className="bg-yellow-400 text-black p-4 rounded mb-3 border border-yellow-800" style={{ backgroundColor: "#fff3cd" }}>
                            <div className="flex items-center">
                                <FaExclamationTriangle className="text-yellow-800 mr-1" />
                                <div>
                                    <p className="text-yellow-800">This file type cannot be viewed within this page. To view the file, please download it.</p>
                                    <p className="text-yellow-800">If you want a preview for this file type, you can create an issue on <b><a href="https://github.com/vliz-be-opsci/rocrate-preview-widget/issues">vliz-be-opsci</a></b></p>
                                </div>
                            </div>
                        </div>
                        <pre className="bg-gray-100 p-4">{content.slice(0, 2000)}</pre>
                    </div>
                );
        }
    };

    return <div>{renderContent()}</div>;
};

export default FileContentPreview;
