import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
    fileUrl: string;
}

const PdfPreview = ({ fileUrl }: PdfPreviewProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [inputPageNumber, setInputPageNumber] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const goToPrevPage = () => setPageNumber(prevPage => Math.max(prevPage - 1, 1));
    const goToNextPage = () => setPageNumber(prevPage => Math.min(prevPage + 1, numPages || 1));
    const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        setInputPageNumber(value);
    };
    const goToPage = () => {
        if (inputPageNumber > 0 && inputPageNumber <= (numPages || 1)) {
            setPageNumber(inputPageNumber);
        }
    };

    return (
        <div className="pdf-preview">
            <div className="controls flex justify-center mb-4">
                <button onClick={goToPrevPage} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Previous</button>
                <span className="px-4 py-2">Page {pageNumber} of {numPages}</span>
                <button onClick={goToNextPage} className="px-4 py-2 bg-blue-500 text-white rounded ml-2">Next</button>
                <input
                    type="number"
                    value={inputPageNumber}
                    onChange={handlePageInputChange}
                    className="px-2 py-1 border rounded ml-2"
                    min="1"
                    max={numPages || 1}
                />
                <button onClick={goToPage} className="px-4 py-2 bg-blue-500 text-white rounded ml-2">Go</button>
            </div>
            <div className="flex justify-center">
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} />
                </Document>
            </div>
        </div>
    );
};

export default PdfPreview;
