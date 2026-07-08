import React, { useState } from "react";
import { FaFolder, FaFile, FaFolderOpen, FaLink, FaTag, FaUser, FaInfoCircle } from "react-icons/fa";
import { getLabelForItem, getIDforItem, hasType } from "../../utils/rocrateUtils";

const HasPartDropdown = ({ rocrate, rocrateID, onSelect }: { rocrate: any; rocrateID: string; onSelect: (id: string) => void }) => {
    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!item || !item.hasPart) {
        return null;
    }

    const getIcon = (part: any, isHovered: boolean) => {
        const partItem = rocrate["@graph"].find((g: any) => g["@id"] === part["@id"]);

        if (partItem && partItem.downloadUrl) {
            return (
                <div className="flex items-center mr-2 flex-shrink-0">
                    {isHovered ? <FaFolderOpen className="text-[#4CAF9C] text-lg mr-1" /> : <FaFolder className="text-[#4CAF9C] text-lg mr-1" />}
                    <a href={partItem.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <FaLink className="text-blue-500 text-sm" />
                    </a>
                </div>
            );
        }

        if (partItem && hasType(partItem, "File") && partItem["@id"].startsWith("#")) {
            return (
                <div className="flex items-center mr-2 flex-shrink-0">
                    <FaFile className="text-blue-500 text-lg mr-1" />
                    <FaLink className="text-blue-500 text-sm" />
                </div>
            );
        }

        if (partItem && hasType(partItem, "Dataset")) {
            return isHovered ? (
                <FaFolderOpen className="text-[#4CAF9C] text-lg mr-2 flex-shrink-0" />
            ) : (
                <FaFolder className="text-[#4CAF9C] text-lg mr-2 flex-shrink-0" />
            );
        }

        if (partItem && hasType(partItem, "File")) {
            return <FaFile className="text-blue-500 text-lg mr-2 flex-shrink-0" />;
        }

        if (partItem && (hasType(partItem, "Person") || hasType(partItem, "Organization"))) {
            return <FaUser className="text-orange-500 text-lg mr-2 flex-shrink-0" />;
        }

        return <FaTag className="text-purple-500 text-lg mr-2 flex-shrink-0" />;
    };

    const getPartCount = (partID: string) => {
        const partItem = rocrate["@graph"].find((g: any) => g["@id"] === partID);
        if (partItem && partItem.hasPart) {
            return `${partItem.hasPart.length} items`;
        }
        return "";
    };

    return (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 px-1">
                Parts ({item.hasPart.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {item.hasPart.map((part: any, index: number) => {
                    const partItem = rocrate["@graph"].find((g: any) => g["@id"] === part["@id"]);
                    const type = (partItem && partItem["@type"]) || "Unknown";
                    const typeLabel = Array.isArray(type) ? type.join(", ") : type;
                    const label = getLabelForItem(getIDforItem(part["@id"], rocrate["@graph"]));
                    const partCount = getPartCount(part["@id"]);

                    return (
                        <div
                            key={index}
                            onClick={() => onSelect(part["@id"])}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="bg-white border border-gray-200 hover:border-[#4CAF9C] rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center mb-2">
                                    {getIcon(part, hoveredIndex === index)}
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {typeLabel}
                                    </span>
                                </div>
                                <h4 
                                    className="font-bold text-gray-800 text-sm mb-2 break-all line-clamp-2" 
                                    title={part["@id"]}
                                >
                                    {part["@id"]}
                                </h4>
                            </div>
                            <div className="mt-auto border-t border-gray-100 pt-2 flex justify-between items-center">
                                <p className="text-xs text-gray-600 font-medium break-all mr-2">
                                    Name: {label}
                                </p>
                                {partCount && (
                                    <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 flex-shrink-0">
                                        {partCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HasPartDropdown;
