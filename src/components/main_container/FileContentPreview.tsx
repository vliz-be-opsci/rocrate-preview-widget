import React from "react";
import TabularData from "./TabularData";

interface FileContentPreviewProps {
    fileContent: string;
    mimeType: string;
    fileUrl: string;
}

const FileContentPreview = ({ fileContent, mimeType, fileUrl }: FileContentPreviewProps) => {
    const fileSize = new Blob([fileContent]).size;

    const renderContent = () => {
        console.log(mimeType);
        const isCsv = mimeType.startsWith("text/csv") || mimeType.startsWith("application/vnd.ms-excel");
        if (isCsv) {
            return <TabularData fileContent={fileContent} mimeType={mimeType} />;
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
                        <div className="bg-yellow-400 text-black p-4 rounded mb-3">
                            <h5 className="font-bold">Warning</h5>
                            <p>There is not yet a file viewer implementation for {mimeType}. If you want to view the file, please download it.</p>
                        </div>
                        <pre className="bg-gray-100 p-4">{fileContent.slice(0, 2000)}</pre>
                    </div>
                );
        }
    };

    return <div>{renderContent()}</div>;
};

export default FileContentPreview;
