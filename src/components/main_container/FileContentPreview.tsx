import React from "react";
import TabularData from "./TabularData";
import CodePreview from "./CodePreview";
import ImagePreview from "./ImagePreview";
import { FaExclamationTriangle } from "react-icons/fa";

interface FileContentPreviewProps {
    fileContent: string;
    mimeType: string;
    fileUrl: string;
}

const FileContentPreview = ({ fileContent, mimeType, fileUrl }: FileContentPreviewProps) => {
    const fileSize = new Blob([fileContent]).size;
    const fileName = fileUrl.split('/').pop() || "";

    const renderContent = () => {
        console.log(mimeType);
        const isCsv = mimeType.startsWith("text/csv") || mimeType.startsWith("application/vnd.ms-excel");
        if (isCsv) {
            return <TabularData fileContent={fileContent} mimeType={mimeType} />;
        }

        if (mimeType.startsWith("text/")) {
            return <CodePreview fileContent={fileContent} mimeType={mimeType} fileName={fileName} />;
        }

        if (mimeType.startsWith("image/")) {
            return <ImagePreview fileUrl={fileUrl} mimeType={mimeType} />;
        }

        switch (mimeType) {
            // Add cases for different MIME types here
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
                                </div>
                            </div>
                        </div>
                        <pre className="bg-gray-100 p-4">{fileContent.slice(0, 2000)}</pre>
                    </div>
                );
        }
    };

    return <div>{renderContent()}</div>;
};

export default FileContentPreview;
