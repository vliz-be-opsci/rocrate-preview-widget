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
                <div className="space-y-2">
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
                    <span className="truncate cursor-pointer text-blue-600 hover:underline" onClick={() => onSelect(stringValue)} title={stringValue}>
                        {getLabelForItem(getIDforItem(value, rocrate["@graph"]))}
                    </span>
                );
            }
            if (key === "email") {
                return (
                    <a href={`mailto:${stringValue}`} className="flex items-center" title={stringValue}>
                        <FaEnvelope className="mr-1" />
                        <span className="truncate">{stringValue}</span>
                    </a>
                );
            }
            return <span className="truncate" title={stringValue}>{stringValue}</span>;
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {Object.entries(data).map(([key, value], index) => (
                <div key={index} className="bg-white p-4 rounded shadow-md">
                    <div className="font-semibold mb-2">
                        {key.startsWith("@") ? (
                            key
                        ) : (
                            <a href={`http://schema.org/${key}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <FaLink className="mr-1" />
                                {key}
                            </a>
                        )}
                    </div>
                    <div className="text-gray-700">
                        {Array.isArray(value) && value.some(item => typeof item === "object" && item !== null) ? (
                            value.map((item, idx) => (
                                <div key={idx} className="mb-2">
                                    {renderValue(item, key)}
                                </div>
                            ))
                        ) : (
                            renderValue(value, key)
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MetadataTable;
