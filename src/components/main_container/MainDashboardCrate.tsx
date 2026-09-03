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

    const specVersionLabel = data["rocrate_spec_version"] && data["rocrate_spec_version"] !== "unknown"
        ? `RO-Crate ${data["rocrate_spec_version"]}`
        : data["rocrate_conformsto"] || "Unknown";

    return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderDataItem("Author", data["rocrate_author"], FaUser)}
            {renderDataItem("Date Published", data["rocrate_datePublished"], FaCalendarAlt)}
            {renderDataItem("Description", data["rocrate_description"], FaInfoCircle)}
            {renderDataItem("Keywords", data["rocrate_keywords"], FaTags)}
            {renderDataItem("License", data["rocrate_license"], FaFileContract)}
            {renderDataItem("Version RO-Crate Specification", specVersionLabel, FaFileContract)}
            {data["rocrate_profiles"] && data["rocrate_profiles"].length > 0 && (
                <div className="p-4 rounded-lg border bg-white border-gray-200 text-gray-800 flex items-start space-x-3 col-span-1 md:col-span-2 lg:col-span-3">
                    <FaFileContract className="mt-1 flex-shrink-0 text-[#4CAF9C]" aria-hidden="true" />
                    <div className="flex flex-col w-full">
                        <span className="text-sm font-medium text-gray-500">Conforming Profiles</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {data["rocrate_profiles"].map((profileUri: string, idx: number) => {
                                const profileName = profileUri.split("/").filter(Boolean).pop() || profileUri;
                                return (
                                    <a
                                        key={idx}
                                        href={profileUri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold px-2.5 py-1 rounded border border-teal-200 transition-colors"
                                    >
                                        {profileName}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainDashboardCrate;
