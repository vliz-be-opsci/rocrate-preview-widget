import React, { useState } from "react";
import ColumnSummaryTable from "./ColumnSummaryTable";
import { FaTable, FaList } from "react-icons/fa";

interface TabularDataProps {
    fileContent: string;
    mimeType: string;
}

const TabularData = ({ fileContent, mimeType }: TabularDataProps) => {
    const [showSummary, setShowSummary] = useState(true);

    const detectDelimiter = (content: string) => {
        const delimiters = [",", "\t", ";", "|"];
        const lines = content.split("\n");
        const counts = delimiters.map((delimiter) => ({
            delimiter,
            count: lines[0].split(delimiter).length,
        }));
        return counts.reduce((max, current) => (current.count > max.count ? current : max)).delimiter;
    };

    const delimiter = detectDelimiter(fileContent);

    const parseCSV = (content: string, delimiter: string) => {
        const rows = content.split("\n");
        return rows.map((row) => {
            const regex = new RegExp(`(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"${delimiter}]+)|\"\"|)${delimiter}`, "g");
            const result = [];
            let match;
            while ((match = regex.exec(row)) !== null) {
                result.push(match[1] || match[2] || "");
            }
            return result;
        });
    };

    const rows = parseCSV(fileContent, delimiter);
    const headers = rows[0];
    const body = rows.slice(1);

    const fileSize = new Blob([fileContent]).size;

    return (
        <div>
            <div className="flex space-x-2 mb-4">
                <span className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Total Rows: {body.length}</span>
                <span className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Columns: {headers.length}</span>
                <span className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                <span className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                <button
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4CAF9C] rounded hover:bg-[#388E7B] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowSummary(!showSummary)}
                >
                    {showSummary ? <FaTable className="mr-2" /> : <FaList className="mr-2" />}
                    {showSummary ? "Show Head of File" : "Show Table Summary"}
                </button>
            </div>
            {showSummary ? (
                <ColumnSummaryTable fileContent={fileContent} />
            ) : (
                <div className="overflow-x-auto mb-5">
                    <h2 className="text-lg font-semibold">Head of file</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#4CAF9C]">
                            <tr>
                                {headers.map((header, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider"
                                        style={{ maxWidth: "300px" }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {body.slice(0, 5).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="px-6 py-1 whitespace-nowrap text-sm text-gray-500"
                                            style={{ maxWidth: "300px", cursor: "pointer" }}
                                            title={cell}
                                        >
                                            <div className="truncate" style={{ maxWidth: "300px" }}>
                                                {cell}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TabularData;
