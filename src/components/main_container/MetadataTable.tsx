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
                                <div className="block truncate" title={JSON.stringify(item)}>
                                    {renderValue(item, key)}
                                </div>
                            ) : (
                                <span className="block truncate" title={item}>
                                    {item}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            );
        } else if (typeof value === "object" && value !== null) {
            return <MetadataTable data={value} rocrate={rocrate} onSelect={onSelect} />;
        } else {
            const stringValue = value;
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
        <div>
            {/* Display @id and @type on a single line */}
            {(data["@id"] || data["@type"]) && (
                <div className="mb-4 flex items-center gap-4">
                    {data["@id"] && (
                        <span
                            className="truncate cursor-pointer text-blue-600 hover:underline"
                            onClick={() => onSelect(data["@id"])}
                            title={data["@id"]}
                        >
                            {getLabelForItem(getIDforItem(data["@id"], rocrate["@graph"]))}
                        </span>
                    )}
                    {data["@type"] && (
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(data["@type"])
                                ? data["@type"].map((type, idx) => (
                                      <span
                                          key={idx}
                                          className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                                      >
                                          {type}
                                      </span>
                                  ))
                                : (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {data["@type"]}
                                    </span>
                                )}
                        </div>
                    )}
                </div>
            )}

            {/* Render the rest of the metadata */}
            <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                {Object.entries(data).map(([key, value], index) => {
                    if (key === "@id" || key === "@type") return null; // Skip rendering @id and @type labels
                    return (
                        key !== "hasPart" && (
                            <div
                                key={index}
                                className="bg-white p-4 rounded shadow-md truncate"
                                title={typeof value === "object" ? JSON.stringify(value) : String(value || "")}
                            >
                                <div className="font-semibold mb-2">
                                    {key.startsWith("@") ? null : (
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
                        )
                    );
                })}
            </div>
        </div>
    );
};

export default MetadataTable;
