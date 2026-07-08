import * as React from "react";
import { FaFolder, FaFile, FaUser, FaInfoCircle, FaTag, FaFolderOpen, FaDownload } from "react-icons/fa";
import { getLabelForItem, getIDforItem, hasType } from "../../utils/rocrateUtils";
import { downloadFileFromCrate } from "../../utils/downloadWithFilename";

interface SearchDropdownProps {
    rocrate: any;
    onSelect: (id: string) => void;
}

export default function SearchDropdown({ rocrate, onSelect }: SearchDropdownProps) {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    const getSortedParts = (parts: any[]) => {
        if (!Array.isArray(parts)) return [];
        return [...parts].sort((a, b) => {
            const aIsFolder = a["@id"] && String(a["@id"]).endsWith("/");
            const bIsFolder = b["@id"] && String(b["@id"]).endsWith("/");
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return String(a["@id"] || "").localeCompare(String(b["@id"] || ""));
        });
    };

    const getIcon = (item: any, isHovered: boolean) => {
        const partItem = rocrate["@graph"].find((g: any) => g["@id"] === item["@id"]);
        if (partItem && hasType(partItem, "Dataset")) {
            return isHovered ? <FaFolderOpen className="text-[#4CAF9C] text-lg mr-2 flex-shrink-0" /> : <FaFolder className="text-[#4CAF9C] text-lg mr-2 flex-shrink-0" />;
        }
        if (partItem && hasType(partItem, "File")) {
            return <FaFile className="text-blue-500 text-lg mr-2 flex-shrink-0" />;
        }
        if (partItem && (hasType(partItem, "Person") || hasType(partItem, "Organization"))) {
            return <FaUser className="text-orange-500 text-lg mr-2 flex-shrink-0" />;
        }
        return <FaTag className="text-purple-500 text-lg mr-2 flex-shrink-0" />;
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight || !highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, index) => 
                    regex.test(part) ? (
                        <mark key={index} className="bg-yellow-100 text-teal-800 font-semibold rounded px-0.5">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const items = rocrate && Array.isArray(rocrate["@graph"]) ? rocrate["@graph"] : [];

    if (items.length === 0) {
        return (
            <div className="search-results-container w-full text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm mt-2">
                <FaInfoCircle className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500 font-medium">No results found matching your search.</p>
            </div>
        );
    }

    return (
        <div className="search-results-container w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 px-1">
                Search Results ({items.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSortedParts(items).map((item: any, index: number) => {
                    const type = item["@type"] || "Unknown";
                    const typeLabel = Array.isArray(type) ? type.join(", ") : type;
                    const label = getLabelForItem(getIDforItem(item["@id"], items));
                    const downloadUrl = item.downloadUrl || item.downloadURL;
                    
                    return (
                        <div
                            key={index}
                            onClick={() => onSelect(item["@id"])}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="bg-white border border-gray-200 hover:border-[#4CAF9C] rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                        {getIcon(item, hoveredIndex === index)}
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {typeLabel}
                                        </span>
                                    </div>
                                    {downloadUrl && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadFileFromCrate(downloadUrl, item["@id"], item["name"], item["encodingFormat"]);
                                            }}
                                            className="text-[#4CAF9C] hover:text-[#3e8e7e] transition-colors p-1.5 rounded-full hover:bg-teal-50 flex-shrink-0"
                                            title="Download File"
                                        >
                                            <FaDownload size={14} />
                                        </button>
                                    )}
                                </div>
                                <h4 
                                    className="font-bold text-gray-800 text-sm mb-2 break-all line-clamp-2" 
                                    title={item["@id"]}
                                >
                                    {item["@id"]}
                                </h4>
                            </div>
                            <div className="mt-auto border-t border-gray-100 pt-2">
                                {item._matchedPath ? (
                                    <>
                                        <div className="flex items-center mb-1">
                                            <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 break-all">
                                                {item._matchedPath}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 italic break-all line-clamp-2 mb-2">
                                            {highlightText(item._matchedValue, item._matchedQuery)}
                                        </p>
                                    </>
                                ) : null}
                                <p className="text-xs text-gray-600 font-medium break-all">
                                    Name: {label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
