import React from "react";
import { getReferencedBy } from "../../utils/graph_utils";

interface ReferencedByListProps {
    rocrate: any;
    rocrateID: string;
    onSelect: (id: string) => void;
}

const ReferencedByList = ({ rocrate, rocrateID, onSelect }: ReferencedByListProps) => {
    
    const referencedBy = getReferencedBy(rocrate, rocrateID);
    
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
