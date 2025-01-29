import React from "react";
import { FaLink } from "react-icons/fa";

interface MetadataTableProps {
    data: any;
    onSelect: (id: string) => void;
}

const MetadataTable = ({ data, onSelect }: MetadataTableProps) => {
    const renderValue = (value: any) => {
        if (Array.isArray(value)) {
            return (
                <ul className="list-disc pl-5">
                    {value.map((item, index) => (
                        <li key={index}>{renderValue(item)}</li>
                    ))}
                </ul>
            );
        } else if (typeof value === "object" && value !== null) {
            return <MetadataTable data={value} onSelect={onSelect} />;
        } else {
            return <span>{JSON.stringify(value)}</span>;
        }
    };

    return (
        <table className="min-w-full bg-white">
            <tbody>
                {Object.entries(data).map(([key, value], index) => (
                    <tr key={index}>
                        <td className="py-2 px-4 border-b text-left" style={{ width: "50px" }}>
                            {key.startsWith("@") ? (
                                key
                            ) : (
                                <a href={`http://schema.org/${key}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                    <FaLink className="mr-1" />
                                    {key}
                                </a>
                            )}
                        </td>
                        <td
                            className={`py-2 px-4 border-b text-left ${key === "@id" ? "cursor-pointer text-blue-600 hover:underline" : ""}`}
                            onClick={key === "@id" ? () => onSelect(value) : undefined}
                        >
                            {renderValue(value)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MetadataTable;
