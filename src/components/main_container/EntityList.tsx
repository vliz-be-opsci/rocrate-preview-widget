import React from "react";
import { getContextLink, countTypesFromComponentTypes } from "../../utils/rocrateUtils";
import { getLabelForItem, getIDforItem } from "../../utils/rocrateUtils";
import MapView from "./MapView";

interface EntityListProps {
    rocrate: any;
    onSelect: (id: string) => void;
    rocrateID: string;
}

const EntityList = ({ rocrate, onSelect, rocrateID }: EntityListProps) => {
    const entities = rocrate["@graph"].filter((item: any) => item["@type"] !== "Dataset" && item["@type"] !== "File");

    const [showMapView, setShowMapView] = React.useState(false);

    // Compute type tally for entities
    const typeTally = countTypesFromComponentTypes(entities);

    return (
        <div className="mt-4">
            <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold">Entities</h2>
                <button
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setShowMapView((prev) => !prev)}
                >
                    Toggle Map View
                </button>
            </div>
            <div className="mb-2 flex flex-wrap items-center">
                {Object.entries(typeTally).map(([type, count], i) => (
                    <span
                        key={`${type}-${i}`}
                        className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 mb-1 px-2.5 py-0.5 rounded"
                    >
                        {type}: {count}
                    </span>
                ))}
            </div>
            {showMapView && <MapView rocrate={rocrate} rocrateID={rocrateID} />}
            <ul className="bg-white border border-gray-200 rounded shadow-lg p-4">
                {entities.map((entity: any, index: number) => (
                    <li
                        key={index}
                        className="p-2 hover:bg-[#4CAF9C]/80 hover:text-white cursor-pointer flex items-center justify-between"
                        onClick={() => onSelect(entity["@id"])}
                    >
                        <div className="flex items-center">
                            {getLabelForItem(getIDforItem(entity["@id"], rocrate["@graph"]))}
                        </div>
                        <div className="flex items-center space-x-2">
                            {Array.isArray(entity["@type"]) ? (
                                entity["@type"].map((type: string, idx: number) => (
                                    <a
                                        key={idx}
                                        href={getContextLink(rocrate, type)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded hover:underline"
                                    >
                                        {type}
                                    </a>
                                ))
                            ) : (
                                <a
                                    href={getContextLink(rocrate, entity["@type"])}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded hover:underline"
                                >
                                    {entity["@type"]}
                                </a>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EntityList;
