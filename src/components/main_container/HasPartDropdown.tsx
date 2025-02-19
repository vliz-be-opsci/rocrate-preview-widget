import React, { useState } from "react";
import { FaFolder, FaFile, FaFolderOpen } from "react-icons/fa";
import { getLabelForItem, getIDforItem } from "../../utils/rocrateUtils";

const HasPartDropdown = ({ rocrate, rocrateID, onSelect }: { rocrate: any; rocrateID: string; onSelect: (id: string) => void }) => {
    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!item || !item.hasPart) {
        return null;
    }

    const getIcon = (part: any, isHovered: boolean) => {
        const partItem = rocrate["@graph"].find((item: any) => item["@id"] === part["@id"]);
        if (partItem && partItem["@type"] === "Dataset") {
            return isHovered ? <FaFolderOpen className="mr-2" /> : <FaFolder className="mr-2" />;
        }
        return <FaFile className="mr-2" />;
    };

    const getPartCount = (partID: string) => {
        const partItem = rocrate["@graph"].find((item: any) => item["@id"] === partID);
        if (partItem && partItem.hasPart) {
            return `(${partItem.hasPart.length} items)`;
        }
        return "";
    };

    return (
        <ul className="mt-1 mb-1 w-full bg-white border border-gray-200 rounded shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-2 p-1">
            {item.hasPart.map((part: any, index: number) => (
                <li
                    key={index}
                    className="p-2 hover:bg-[#4CAF9C]/80 hover:text-white cursor-pointer flex items-center"
                    onClick={() => onSelect(part["@id"])}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <div className="flex items-center">
                        {getIcon(part, hoveredIndex === index)}
                    </div>
                    <div className="flex-1 text-left truncate" title={part["@id"]} style={{ direction: 'rtl', textAlign: 'left' }}>
                        {getLabelForItem(getIDforItem(part["@id"], rocrate["@graph"]))}
                    </div>
                    <span className="ml-2 text-xs font-medium">{getPartCount(part["@id"])}</span>
                </li>
            ))}
        </ul>
    );
};

export default HasPartDropdown;
