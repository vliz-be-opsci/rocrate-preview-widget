import React, { useState, useEffect } from "react";
import TabularData from "./TabularData";
import CodePreview from "./CodePreview";
import ImagePreview from "./ImagePreview";
import PdfPreview from "./PdfPreview";
import AudioPreview from "./AudioPreview";
//import TurtlePreview from "./TurtlePreview";
import { FaExclamationTriangle } from "react-icons/fa";

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
            } catch (err) {
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
        if (isCsv) {
            return <TabularData fileContent={content} mimeType={mimeType} />;
        }
        /*
        if (mimeType.startsWith("text/turtle")) {
            return <TurtlePreview fileContent={content} mimeType={mimeType} fileUrl={fileUrl}/>;
        }
        */

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
                                    <p className="text-yellow-800"> There is not yet a file viewer implementation for {mimeType}. If you want to view the file, please download it.</p>
                                    <p className="text-yellow-800"> If you want a preview for this filetype , make an issue at <b><a href="https://github.com/vliz-be-opsci/rocrate-preview-widget/issues">vliz-be-opsci</a></b></p>
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
