import React from "react";
import { getContextLink, getLabelForItem, getIDforItem, hasType } from "../../utils/rocrateUtils";

interface EntityListProps {
    rocrate: any;
    onSelect: (id: string) => void;
}

const EntityList = ({ rocrate, onSelect }: EntityListProps) => {
    const entities = (rocrate["@graph"] || []).filter((item: any) => !hasType(item, "Dataset") && !hasType(item, "File"));

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Entities</h2>
            <ul className="bg-white border border-gray-200 rounded shadow-lg p-4">
                {entities.map((entity: any, index: number) => {
                    const typeDisplay = Array.isArray(entity["@type"]) ? entity["@type"].join(", ") : entity["@type"];
                    return (
                        <li
                            key={index}
                            className="p-2 hover:bg-[#4CAF9C]/80 hover:text-white cursor-pointer flex items-center justify-between"
                            onClick={() => onSelect(entity["@id"])}
                        >
                            <div className="flex items-center">
                                {getLabelForItem(getIDforItem(entity["@id"], rocrate["@graph"]))}
                            </div>
                            <a
                                href={getContextLink(rocrate, entity["@type"])}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                {typeDisplay}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default EntityList;
