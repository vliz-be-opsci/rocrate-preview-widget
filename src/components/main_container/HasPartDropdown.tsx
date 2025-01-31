import React from "react";
import { FaFolder, FaFile } from "react-icons/fa";

const HasPartDropdown = ({ rocrate, rocrateID, onSelect }: { rocrate: any; rocrateID: string; onSelect: (id: string) => void }) => {
    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);

    if (!item || !item.hasPart) {
        return null;
    }

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        const extension = text.includes(".") ? text.slice(text.lastIndexOf(".")) : "";
        const truncated = text.slice(0, maxLength - extension.length - 3);
        return `${truncated}...${extension}`;
    };

    const getIcon = (part: any) => {
        const partItem = rocrate["@graph"].find((item: any) => item["@id"] === part["@id"]);
        if (partItem && partItem["@type"] === "Dataset") {
            return <FaFolder className="mr-2" />;
        }
        return <FaFile className="mr-2" />;
    };

    return (
        <ul className="mt-1 mb-1 w-full bg-white border border-gray-200 rounded shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-2 p-1">
            {item.hasPart.map((part: any, index: number) => (
                <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => onSelect(part["@id"])}>
                    {getIcon(part)}
                    {truncateText(part["@id"], 40)}
                </li>
            ))}
        </ul>
    );
};

export default HasPartDropdown;
