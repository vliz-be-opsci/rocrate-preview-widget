import * as React from "react";
import { FaFolder, FaFile, FaUser, FaInfoCircle, FaTag } from "react-icons/fa";
import { SearchMatch } from "../../utils/searchUtils";

interface SearchDropdownProps {
    results: SearchMatch[];
    onSelect: (id: string) => void;
}

export default function SearchDropdown({ results, onSelect }: SearchDropdownProps) {
    const getIcon = (type: any) => {
        const types = Array.isArray(type) ? type : [type];
        if (types.includes("Dataset")) {
            return <FaFolder className="text-[#4CAF9C] text-lg mr-2 flex-shrink-0" />;
        }
        if (types.includes("File")) {
            return <FaFile className="text-blue-500 text-lg mr-2 flex-shrink-0" />;
        }
        if (types.includes("Person") || types.includes("Organization")) {
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

    if (results.length === 0) {
        return (
            <div className="w-full text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                <FaInfoCircle className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500 font-medium">No results found matching your search.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 px-1">
                Search Results ({results.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((match, index) => {
                    const item = match.item;
                    const type = item["@type"] || "Unknown";
                    return (
                        <div
                            key={index}
                            onClick={() => onSelect(item["@id"])}
                            className="bg-white border border-gray-200 hover:border-[#4CAF9C] rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center mb-2">
                                    {getIcon(type)}
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {Array.isArray(type) ? type.join(", ") : type}
                                    </span>
                                </div>
                                <h4 
                                    className="font-bold text-gray-800 text-sm mb-3 break-all line-clamp-2" 
                                    title={item["@id"]}
                                >
                                    {item["@id"]}
                                </h4>
                            </div>
                            <div className="mt-auto border-t border-gray-100 pt-2">
                                <div className="flex items-center mb-1">
                                    <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 break-all">
                                        {match.matchedPath}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 italic break-all line-clamp-2">
                                    {highlightText(match.matchedValue, match.query)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
