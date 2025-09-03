import React from "react";
import { getContextLink } from "../../utils/rocrateUtils";
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
                        <a
                            href={getContextLink(rocrate, entity["@type"])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {entity["@type"]}
                        </a>
                    </li>
                ))}
            </ul>
            
        </div>
    );
};

export default EntityList;
