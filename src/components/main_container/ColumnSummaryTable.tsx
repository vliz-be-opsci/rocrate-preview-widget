import React from "react";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { extent, mean, median, deviation } from "d3-array";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface ColumnSummaryTableProps {
    fileContent: string;
}

const ColumnSummaryTable = ({ fileContent }: ColumnSummaryTableProps) => {
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

        if (uniqueValues.size <= 10) {
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
            return <Doughnut data={data} />;
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
            return <Bar data={data} />;
        } else {
            return (
                <div>
                    <p>Min Length: {summary.minLength}</p>
                    <p>Max Length: {summary.maxLength}</p>
                    <p>Unique Strings: {summary.uniqueStrings}</p>
                </div>
            );
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#4CAF9C]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Column</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">NA Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Summary</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {headers.map((header, index) => {
                        const column = body.map((row) => row[index] || "");
                        const type = getColumnType(column);
                        const summary = getColumnSummary(column, type);
                        return (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{header}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary.naCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderChart(summary, type)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ColumnSummaryTable;
