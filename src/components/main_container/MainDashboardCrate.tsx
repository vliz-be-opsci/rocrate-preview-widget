import React from "react";

interface MainDashboardCrateProps {
    data: any;
    rocrate: any;
}

const MainDashboardCrate = ({ data, rocrate }: MainDashboardCrateProps) => {
    const renderDataItem = (label: string, value: string) => (
        <div className={`p-2 ${value === "None" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} rounded mb-2`}>
            <span className="font-semibold">{label}: </span>
            <span>{value}</span>
        </div>
    );

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-lg font-semibold mb-4">RO-Crate Summary</h2>
            {renderDataItem("Author", data["rocrate_author"])}
            {renderDataItem("Date Published", data["rocrate_datePublished"])}
            {renderDataItem("Description", data["rocrate_description"])}
            {renderDataItem("Keywords", data["rocrate_keywords"])}
            {renderDataItem("License", data["rocrate_license"])}
        </div>
    );
};

export default MainDashboardCrate;
