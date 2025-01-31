import React from "react";

interface EntityListProps {
    rocrate: any;
    onSelect: (id: string) => void;
}

const EntityList = ({ rocrate, onSelect }: EntityListProps) => {
    const entities = rocrate["@graph"].filter((item: any) => item["@type"] !== "Dataset" && item["@type"] !== "File");

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Entities</h2>
            <ul className="bg-white border border-gray-200 rounded shadow-lg p-4">
                {entities.map((entity: any, index: number) => (
                    <li
                        key={index}
                        className="p-2 hover:bg-[#4CAF9C]/80 hover:text-white cursor-pointer flex items-center"
                        onClick={() => onSelect(entity["@id"])}
                    >
                        {entity["@id"]}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EntityList;
