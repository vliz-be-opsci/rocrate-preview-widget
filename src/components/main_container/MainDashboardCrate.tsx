import React from "react";
import { FaUser, FaCalendarAlt, FaInfoCircle, FaTags, FaFileContract } from "react-icons/fa";

interface MainDashboardCrateProps {
    data: any;
    rocrate: any;
}

const MainDashboardCrate = ({ data, rocrate }: MainDashboardCrateProps) => {
    console.log("MainDashboardCrate data", data);
    console.log("MainDashboardCrate rocrate", rocrate);
const renderDataItem = (label: string, value: any, Icon: any) => {
    const displayValue = (typeof value === 'object' && value !== null) ? (value["@id"] || JSON.stringify(value)) : value;
    return (
        <div className={`p-2 ${displayValue === "None" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} rounded mb-2 flex items-center`}>
            <Icon className="mr-2" />
            <span className="font-semibold">{label}: </span>
            <span>{displayValue}</span>
        </div>
    );
};

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            {renderDataItem("Author", data["rocrate_author"], FaUser)}
            {renderDataItem("Date Published", data["rocrate_datePublished"], FaCalendarAlt)}
            {renderDataItem("Description", data["rocrate_description"], FaInfoCircle)}
            {renderDataItem("Keywords", data["rocrate_keywords"], FaTags)}
            {renderDataItem("License", data["rocrate_license"], FaFileContract)}
        </div>
    );
};

export default MainDashboardCrate;
