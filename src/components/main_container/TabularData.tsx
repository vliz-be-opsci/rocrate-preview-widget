import React from "react";
import { useTable, useResizeColumns, useFlexLayout } from "react-table";

interface TabularDataProps {
    fileContent: string;
    mimeType: string;
}

const TabularData = ({ fileContent, mimeType }: TabularDataProps) => {
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

    const totalData = React.useMemo(() => {
        const rows = fileContent.split("\n").map((row) => row.split(delimiter));
        const headers = rows[0];
        const body = rows.slice(1);
        return body.map((row) => {
            const rowData: { [key: string]: string } = {};
            headers.forEach((header, index) => {
                rowData[header] = row[index];
            });
            return rowData;
        });
    }, [fileContent, delimiter]);

    const data = React.useMemo(() => totalData.slice(0, 20), [totalData]);

    const columns = React.useMemo(
        () =>
            fileContent
                .split("\n")[0]
                .split(delimiter)
                .map((header) => ({
                    Header: header,
                    accessor: header,
                    minWidth: 100,
                    maxWidth: 300,
                    Cell: ({ value }: { value: string }) => (
                        <div className="truncate" style={{ maxWidth: "300px" }}>
                            {value}
                        </div>
                    ),
                })),
        [fileContent, delimiter]
    );

    const tableInstance = useTable(
        { columns, data },
        useFlexLayout,
        useResizeColumns
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

    const fileSize = new Blob([fileContent]).size;

    return (
        <div>
            <div className="flex space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Total Rows: {totalData.length}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Columns: {columns.length}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
            </div>
            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#4CAF9C]">
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th
                                    {...column.getHeaderProps()}
                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    style={{ maxWidth: "300px" }}
                                >
                                    {column.render("Header")}
                                    <div
                                        {...column.getResizerProps()}
                                        className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                                    />
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                    {rows.slice(0, 5).map((row) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => (
                                    <td
                                        {...cell.getCellProps()}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        style={{ maxWidth: "300px" }}
                                    >
                                        {cell.render("Cell")}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TabularData;
