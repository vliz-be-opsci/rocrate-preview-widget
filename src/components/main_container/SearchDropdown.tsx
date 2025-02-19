import * as React from "react";
import { FaFolder, FaFile, FaFolderOpen } from "react-icons/fa";

interface SearchDropdownProps {
    rocrate: any;
    onSelect: (id: string) => void;
}

export default function SearchDropdown({ rocrate, onSelect }: SearchDropdownProps) {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    const getSortedParts = (parts: any[]) => {
        return parts.sort((a, b) => {
            const aIsFolder = a["@id"].endsWith("/");
            const bIsFolder = b["@id"].endsWith("/");
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a["@id"].localeCompare(b["@id"]);
        });
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        const extension = text.includes(".") ? text.slice(text.lastIndexOf(".")) : "";
        const truncated = text.slice(0, maxLength - extension.length - 3);
        return `${truncated}...${extension}`;
    };

    const getIcon = (part: any, isHovered: boolean) => {
        const partItem = rocrate["@graph"].find((item: any) => item["@id"] === part["@id"]);
        if (partItem && partItem["@type"] === "Dataset") {
            return isHovered ? <FaFolderOpen className="mr-2" /> : <FaFolder className="mr-2" />;
        }
        return <FaFile className="mr-2" />;
    };

    return (
        <div>
            <ul className="mt-1 mb-1 w-full bg-white border border-gray-200 rounded shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-2 p-1">
                {getSortedParts(rocrate["@graph"]).map((item: any, index: number) => (
                    <li
                        key={index}
                        className="p-2 hover:bg-[#4CAF9C]/80 hover:text-white cursor-pointer flex items-center"
                        onClick={() => onSelect(item["@id"])}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="flex items-center">
                            {getIcon(item, hoveredIndex === index)}
                        </div>
                        <div className="flex-1 text-right truncate" title={item["@id"]}>
                            {item["@id"]}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
