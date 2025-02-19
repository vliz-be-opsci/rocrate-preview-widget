import React from "react";
import { FaLink, FaEnvelope } from "react-icons/fa";
import { getLabelForItem, getIDforItem } from "../../utils/rocrateUtils";

interface MetadataTableProps {
    data: any;
    rocrate: any;
    onSelect: (id: string) => void;
}

const MetadataTable = ({ data, rocrate, onSelect }: MetadataTableProps) => {
    const renderValue = (value: any, key: string) => {
        if (Array.isArray(value)) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {value.map((item, index) => (
                        <div key={index} className="bg-gray-100 p-2 rounded">
                            {typeof item === "object" && item !== null ? (
                                <div className="block truncate">{renderValue(item, key)}</div>
                            ) : (
                                renderValue(item, key)
                            )}
                        </div>
                    ))}
                </div>
            );
        } else if (typeof value === "object" && value !== null) {
            return <MetadataTable data={value} rocrate={rocrate} onSelect={onSelect} />;
        } else {
            const stringValue = value;
            if (key === "@id") {
                return (
                    <span className="truncate cursor-pointer text-blue-600 hover:underline" onClick={() => onSelect(stringValue)}>
                        {getLabelForItem(getIDforItem(value, rocrate["@graph"]))}
                    </span>
                );
            }
            if (key === "email") {
                return (
                    <a href={`mailto:${stringValue}`} className="flex items-center">
                        <FaEnvelope className="mr-1" />
                        <span className="truncate">{stringValue}</span>
                    </a>
                );
            }
            return <span className="truncate" title={stringValue}>{stringValue}</span>;
        }
    };

    return (
        <table className="min-w-full bg-white">
            <tbody>
                {Object.entries(data).map(([key, value], index) => (
                    <tr key={index}>
                        {key !== "@id" && (
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
                        )}
                        <td
                            className={`py-2 px-4 border-b text-left ${key === "@id" ? "cursor-pointer text-blue-600 hover:underline" : ""}`}
                            onClick={key === "@id" ? () => onSelect(value) : undefined}
                        >
                            {renderValue(value, key)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MetadataTable;
