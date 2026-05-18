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
    const displayValue = (typeof value === 'object' && value !== null) ? (value.name || value["@id"] || JSON.stringify(value)) : value;
    const isMissing = displayValue === "None" || !displayValue;

    return (
        <div className={`p-4 rounded-lg border ${isMissing ? "bg-gray-50 border-gray-100 text-gray-500" : "bg-white border-gray-200 text-gray-800"} flex items-start space-x-3`}>
            <Icon className={`mt-1 flex-shrink-0 ${isMissing ? "text-gray-400" : "text-[#4CAF9C]"}`} aria-hidden="true" />
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <span className={`text-base ${isMissing ? "italic" : "font-medium"}`}>
                    {isMissing ? "Not provided" : displayValue}
                </span>
            </div>
        </div>
    );
};

    return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderDataItem("Author", data["rocrate_author"], FaUser)}
            {renderDataItem("Date Published", data["rocrate_datePublished"], FaCalendarAlt)}
            {renderDataItem("Description", data["rocrate_description"], FaInfoCircle)}
            {renderDataItem("Keywords", data["rocrate_keywords"], FaTags)}
            {renderDataItem("License", data["rocrate_license"], FaFileContract)}
            {renderDataItem("Version RO-Crate Specification", data["rocrate_conformsto"], FaFileContract)}
        </div>
    );
};

export default MainDashboardCrate;
