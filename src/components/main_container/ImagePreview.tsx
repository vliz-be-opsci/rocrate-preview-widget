import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ImagePreviewProps {
    fileUrl: string;
    mimeType: string;
}

const ImagePreview = ({ fileUrl, mimeType }: ImagePreviewProps) => {
    const fileSize = new Blob([fileUrl]).size;

    return (
        <div>
            <div className="flex space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
            </div>
            <div className="flex justify-center">
                <img src={fileUrl} alt="Preview" className="max-w-full h-auto" />
            </div>
        </div>
    );
};

export default ImagePreview;
