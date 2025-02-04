import React, { useState, useEffect, useRef } from "react";
import { FaExclamationTriangle, FaChevronDown, FaChevronUp, FaInfoCircle } from "react-icons/fa";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { extent, mean, median, deviation } from "d3-array";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface ColumnSummaryTableProps {
    fileContent: string;
}

const ColumnSummaryTable = ({ fileContent }: ColumnSummaryTableProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [cardWidth, setCardWidth] = useState(0);
    const [filterText, setFilterText] = useState("");
    const [autoFilterNA, setAutoFilterNA] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cardRef.current) {
            setCardWidth(cardRef.current.offsetWidth);
        }
    }, [cardRef.current]);

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
        return rows.map((row) => row.split(delimiter));
    };

    const rows = parseCSV(fileContent, delimiter);
    const headers = rows[0];
    const body = rows.slice(1);

    const getColumnType = (column: string[]) => {
        const uniqueValues = new Set(column.filter((value) => value !== "NA" && value !== ""));
        const numericValues = column.filter((value) => !isNaN(Number(value)) && value !== "NA" && value !== "").map(Number);

        if (uniqueValues.size <= 5) {
            return "categorical";
        } else if (numericValues.length === column.length) {
            return "numeric";
        } else {
            return "string";
        }
    };

    const getColumnSummary = (column: string[], type: string) => {
        const nonEmptyValues = column.filter((value) => value !== "NA" && value !== "");
        const naCount = column.length - nonEmptyValues.length;

        if (type === "categorical") {
            const valueCounts = Array.from(new Set(nonEmptyValues)).map((value) => ({
                value,
                count: nonEmptyValues.filter((v) => v === value).length,
            }));
            return { naCount, valueCounts };
        } else if (type === "numeric") {
            const numericValues = nonEmptyValues.map(Number);
            const [min, max] = extent(numericValues);
            const meanValue = mean(numericValues);
            const medianValue = median(numericValues);
            const stdDev = deviation(numericValues);
            return { naCount, min, max, meanValue, medianValue, stdDev };
        } else {
            const lengths = nonEmptyValues.map((value) => value.length);
            const [minLength, maxLength] = extent(lengths);
            const uniqueStrings = new Set(nonEmptyValues).size;
            return { naCount, minLength, maxLength, uniqueStrings };
        }
    };

    const renderChart = (summary: any, type: string) => {
        if (type === "categorical") {
            const data = {
                labels: summary.valueCounts.map((d: any) => d.value),
                datasets: [
                    {
                        data: summary.valueCounts.map((d: any) => d.count),
                        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0", "#00BCD4", "#E91E63", "#3F51B5", "#8BC34A"],
                    },
                ],
            };

            if (summary.valueCounts.length === 0) {
                return <>
                <div className="bg-yellow-400 text-black p-2 rounded mb-3 border border-yellow-800 flex item-center" style={{ backgroundColor: "#fff3cd" }}>
                    <div className="flex items-center">
                        <FaExclamationTriangle className="text-yellow-800 mr-1" />
                        <div>
                            <p className="text-yellow-800">All values in column are none</p>
                        </div>
                    </div>
                </div>
                </>;
            }

            return <Bar data={data} width={cardWidth} height={200} options={{ indexAxis: 'y', plugins: { legend: { display: false } }, scales: { y: { display: false } } }} />;
        } else if (type === "numeric") {
            const data = {
                labels: ["Min", "Max", "Mean", "Median", "Std Dev"],
                datasets: [
                    {
                        label: "Statistics",
                        data: [summary.min, summary.max, summary.meanValue, summary.medianValue, summary.stdDev],
                        backgroundColor: "#4CAF50",
                    },
                ],
            };
            return <Bar data={data} width={cardWidth} height={200} options={{ plugins: { legend: { display: false } }, scales: { y: { display: false } } }} />;
        } else {
            return (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center">
                        <FaInfoCircle className="text-blue-800 mr-1" />
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Min Length: {summary.minLength}</span>
                    </div>
                    <div className="flex items-center">
                        <FaInfoCircle className="text-blue-800 mr-1" />
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Max Length: {summary.maxLength}</span>
                    </div>
                    <div className="flex items-center">
                        <FaInfoCircle className="text-blue-800 mr-1" />
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Unique Strings: {summary.uniqueStrings}</span>
                    </div>
                </div>
            );
        }
    };

    const renderNAChart = (naCount: number, totalCount: number) => {
        const data = {
            labels: ["NA", "Non-NA"],
            datasets: [
                {
                    data: [naCount, totalCount - naCount],
                    backgroundColor: ["#FF6384", "#4CAF9C"],
                },
            ],
        };
        return <Doughnut data={data} width={100} height={100} options={{ plugins: { legend: { display: false } } }} />;
    };

    const filteredHeaders = headers.filter((header, index) => {
        const column = body.map((row) => row[index] || "");
        const summary = getColumnSummary(column, getColumnType(column));
        const matchesFilter = header.toLowerCase().includes(filterText.toLowerCase());
        const hasNonNAValues = summary.naCount !== column.length;
        return matchesFilter && (!autoFilterNA || hasNonNAValues);
    });

    return (
        <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Table Summary</h2>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Filter columns..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="px-2 py-1 border rounded"
                    />
                    <button
                        className={`px-4 py-2 text-sm font-medium text-white rounded ${autoFilterNA ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        onClick={() => setAutoFilterNA(!autoFilterNA)}
                    >
                        {autoFilterNA ? 'Show All' : 'Hide NA Columns'}
                    </button>
                    <button
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <FaChevronDown className="mr-2" /> : <FaChevronUp className="mr-2" />}
                        {isCollapsed ? "Expand" : "Collapse"}
                    </button>
                </div>
            </div>
            {!isCollapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {filteredHeaders.map((header, index) => {
                        const column = body.map((row) => row[headers.indexOf(header)] || "");
                        const type = getColumnType(column);
                        const summary = getColumnSummary(column, type);
                        return (
                            <div key={index} className="bg-white shadow-md rounded-lg p-4" style={{ width: "100%" }} ref={cardRef}>
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <span>{header}</span>
                                        <div style={{ width: "30px", height: "30px" }}>
                                            {renderNAChart(summary.naCount, column.length)}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 mb-1">
                                        <FaInfoCircle className="text-blue-800" />
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{type}</span>
                                    </div>
                                    <div style={{ width: "100%", height: "100px" }}>
                                        {renderChart(summary, type)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ColumnSummaryTable;
