import * as React from "react";

interface HasPartCountProps {
    rocrate: any;
    rocrateID: string;
}

export default function HasPartCount({ rocrate, rocrateID }: HasPartCountProps) {
    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);

    if (!item || !item.hasPart) {
        return null;
    }

    return (
        <div className="has-part-count">
            Contains {item.hasPart.length} items
        </div>
    );
}
