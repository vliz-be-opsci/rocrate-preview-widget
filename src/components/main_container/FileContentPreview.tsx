import React from "react";

interface FileContentPreviewProps {
    fileContent: string;
    mimeType: string;
}

const FileContentPreview = ({ fileContent, mimeType }: FileContentPreviewProps) => {
    const renderContent = () => {
        console.log(mimeType);
        switch (mimeType) {
            // Add cases for different MIME types here
            default:
                return (
                    <div>
                        <div className="bg-yellow-400 text-white p-4 rounded mb-3">
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
