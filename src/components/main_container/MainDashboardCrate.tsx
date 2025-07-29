import React from "react";
import { FaUser, FaCalendarAlt, FaInfoCircle, FaTags, FaFileContract, FaMapMarkerAlt } from "react-icons/fa";
import MapView from "./MapView";

interface MainDashboardCrateProps {
    data: any;
    rocrate: any;
    rocrateID?: string;
}

const MainDashboardCrate = ({ data, rocrate, rocrateID }: MainDashboardCrateProps) => {
    console.log("MainDashboardCrate data", data);
    console.log("MainDashboardCrate rocrate", rocrate);
    console.log("MainDashboardCrate rocrateID", rocrateID);

const [showMapView, setShowMapView] = React.useState(true);

const renderDataItem = (label: string, value: any, Icon: any) => {
    const displayValue = (typeof value === 'object' && value !== null) ? (value["@id"] || JSON.stringify(value)) : value;

    // Special case for the Map toggle button
    if (label === "Map") {
        return (
            <div className="p-2 bg-blue-100 text-blue-800 rounded mb-2 flex items-center">
                <Icon className="mr-2" />
                <span className="font-semibold">{label}: </span>
                <button
                    className="ml-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setShowMapView(!showMapView)}
                >
                    {showMapView ? "Hide Map View" : "Show Map View"}
                </button>
            </div>
        );
    }

    return (
        <div className={`p-2 ${displayValue === "None" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} rounded mb-2 flex items-center`}>
            <Icon className="mr-2" />
            <span className="font-semibold">{label}: </span>
            <span>{displayValue}</span>
        </div>
    );
};

    return (
        <>
        <div className="p-4 bg-white shadow-md rounded-lg">
            {renderDataItem("Author", data["rocrate_author"], FaUser)}
            {renderDataItem("Date Published", data["rocrate_datePublished"], FaCalendarAlt)}
            {renderDataItem("Description", data["rocrate_description"], FaInfoCircle)}
            {renderDataItem("Keywords", data["rocrate_keywords"], FaTags)}
            {renderDataItem("License", data["rocrate_license"], FaFileContract)}
            {renderDataItem("Version RO-Crate Specification", data["rocrate_conformsto"], FaFileContract)}
            {renderDataItem("Map", null, FaMapMarkerAlt)}
        </div>
        {showMapView && (
            <div className="mt-4 p-4 bg-white shadow-md rounded-lg">
                <MapView rocrate={rocrate} rocrateID={rocrateID || ""} />
            </div>
        )}
        </>
    );
};

export default MainDashboardCrate;
