import React from "react";

interface ReferencedByListProps {
    rocrate: any;
    rocrateID: string;
    onSelect: (id: string) => void;
}

const ReferencedByList = ({ rocrate, rocrateID, onSelect }: ReferencedByListProps) => {
    const referencedBy = rocrate["@graph"].filter((item: any) => {
        return Object.values(item).some((value: any) => {
            if (typeof value === "object" && value !== null) {
                if (Array.isArray(value)) {
                    return value.some((v: any) => v["@id"] === rocrateID);
                } else {
                    return value["@id"] === rocrateID;
                }
            }
            return false;
        });
    });

    return (
        <div className="flex flex-wrap">
            {referencedBy.length > 0 ? (
                referencedBy.map((item: any, index: number) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-4 m-2 cursor-pointer hover:bg-gray-100" onClick={() => onSelect(item["@id"])}>
                        <p className="text-blue-500">{item["@id"]}</p>
                    </div>
                ))
            ) : (
                <p>No references found</p>
            )}
        </div>
    );
};

export default ReferencedByList;
