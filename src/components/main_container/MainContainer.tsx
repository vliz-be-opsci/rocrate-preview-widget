//this file will contain all other components that wil lbe used in this project
import * as React from "react";
import { useState, useEffect } from "react";
import { FaFolderOpen } from "react-icons/fa";
import { AiOutlineCluster } from "react-icons/ai";
import DatasetOverview from "./DatasetOverview";
import SearchComponent from "./SearchComponent";
import SearchDropdown from "./SearchDropdown";
import Breadcrumb, { getFullPath } from "./Breadcrumb";
import RocrateIDViewer from "./RocrateIDViewer";
import HasPartDropdown from "./HasPartDropdown";
import EntityList from "./EntityList";
import MainDashboardCrate from "./MainDashboardCrate";
import { extractRootData, getRoCrateSpecVersion } from "../../utils/rocrateUtils";

//function to extract data from the rocrate.json file
function extractData(rocrate: any) {
    console.log(rocrate);

    if (typeof rocrate !== "object" || rocrate === null) {
        console.log("rocrate is not an object:", rocrate);
        console.log(rocrate["@graph"]);
    }
    let data: { [key: string]: any } = {};
    data["rocrate_context"] = rocrate["@context"];
    console.log("Rocrate context:", data["rocrate_context"]);
    let rootDataEntity = extractRootData(rocrate["@graph"]);
    console.log("Root Data Entity:", rootDataEntity);
    //loop over the @graph array and check if the @id is "./" or "ro-crate-metadata.json"
    for (let i in rocrate["@graph"]) {
        let item = rocrate["@graph"][i];
        console.log(item);
        if (item["@id"] == rootDataEntity["@id"] ) {
            //check if the following attributs exists ["author", "datePublished", "description", "keywords", "license"] if not set them to None
            data["rocrate_author"] = item["publisher"] || item["creator"] || item["author"] || "None";
            data["rocrate_datePublished"] = item["datePublished"] || "None";
            data["rocrate_description"] = item["description"] || "None";
            data["rocrate_keywords"] = item["keywords"] || "None";
            data["rocrate_license"] = item["license"] || "None";
        }

        if (typeof item["@id"] === "string" && item["@id"].endsWith("ro-crate-metadata.json")) {
            // Check if @type is a string or array and if it is an array check if Profile is in the array
            if (Array.isArray(item["@type"])) {
            data["rocrate_isprofile"] = item["@type"].includes("Profile");
            } else {
            data["rocrate_isprofile"] = item["@type"] === "Profile";
            }
            // Get the @id of conformsTo using the utility function that handles both object and array
            data["rocrate_conformsto"] = getRoCrateSpecVersion(item["conformsTo"]);
        }
        i = i + 1;
    }
    console.log(data);
    return data;
}

export default function MainContainer(props: any) {
    console.log(props.container.attributes);
    const preRocrate = props.container.attributes.rocrate.value ||{};
    const [rocrate, setRocrate] = useState(props.container.attributes.rocrate.value ||{});
    const [reponame, setRepoName] = useState(props.container.attributes.rocrate_name.value ||"");
    const [data, setData] = useState({});
    const [rocrateID, setRocrateID] = useState("");
    const [loading, setLoading] = useState(true);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [entityCounts, setEntityCounts] = useState<{ [key: string]: number }>({});

    const handleSelect = (id: string) => {
        setRocrateID(id);
    };

    const handleSearchClose = () => {
        setShowSearchResults(false);
    };

    const handleSearchFocus = () => {
        setShowSearchResults(true);
    };

    const handleSearchResults = (results: any[]) => {
        setSearchResults(results);
    };

    //perform the get request to get the rocrate.json file
    useEffect(() => {
        if (preRocrate.endsWith(".json")) {
            fetch(preRocrate)
                .then(response => response.json())
                .then(jsondata => setRocrate(jsondata))
                .then(() => setLoading(false));
        }else{
            //check if preRocrate is an object and if it is set it to rocrate
            if (preRocrate !== null) {
                console.log("Setting preRocrate as rocrate:", preRocrate);
                //parse the text to json
                try {
                    const parsedRocrate = JSON.parse(preRocrate);
                    console.log("Parsed rocrate:", parsedRocrate);
                    setRocrate(parsedRocrate);
                } catch (error) {
                    console.error("Error parsing preRocrate:", error);
                    window.alert("Error parsing the rocrate data. Please check the format.");
                }
            }
            setLoading(false);
        }
    }, [preRocrate]);
    //when rocrate is updated extract the data from it
    useEffect(() => {
        setData(extractData(rocrate));
    }, [rocrate]);

    useEffect(() => {
        if (!loading && rocrate["@graph"]) {
            const hash = window.location.hash.match(/#crateid=([^&]*)/)?.[1];
            if (hash) {
                const item = rocrate["@graph"].find((item: any) => item["@id"] === hash);
                if (item) {
                    setRocrateID(hash);
                } else {
                    const fullPath = getFullPath(rocrate, hash);
                    if (fullPath) {
                        setRocrateID(fullPath);
                    }
                }
            }
    
            const counts: { [key: string]: number } = {};
            rocrate["@graph"].forEach((item: any) => {
                const type = Array.isArray(item["@type"]) ? item["@type"][0] : item["@type"];
                if (counts[type]) {
                    counts[type]++;
                } else {
                    counts[type] = 1;
                }
            });
            setEntityCounts(counts);
        }
    }, [rocrate, loading]);

    useEffect(() => {
        if (rocrateID) {
            window.location.hash = `#crateid=${rocrateID}`;
        }
        setShowSearchResults(false);
    }, [rocrateID]);

    useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.match(/#crateid=([^&]*)/)?.[1];
            setRocrateID(hash || "");
        };
    
        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    if (loading || Object.keys(rocrate).length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <br/>
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <Breadcrumb rocrate={rocrate} rocrateID={rocrateID} reponame={reponame} onSelect={handleSelect} />
                <SearchComponent
                    rocrate={rocrate}
                    onSelect={handleSelect}
                    onFocus={handleSearchFocus}
                    onResults={handleSearchResults}
                    onClose={handleSearchClose}
                />
            </div>
            {showSearchResults ? (
                <SearchDropdown rocrate={{ "@graph": searchResults }} onSelect={handleSelect} />
            ) : (
                <HasPartDropdown rocrate={rocrate} rocrateID={rocrateID} onSelect={handleSelect} />
            )}
            <br />
            
            {rocrateID === "" ? (
                <>
                <div className="flex flex-col sm:flex-row mt-3">
                    <div className="w-full sm:w-1/2 sm:mb-0 sm:mr-1" onClick={() => setRocrateID("view_dataset_overview")}>
                        <div className="bg-white shadow-md rounded-lg p-6 flex items-center hover:bg-gradient-to-l hover:from-[#4CAF9C] hover:to-white h-full">
                            <span className="text-4xl text-gray-500 mr-2"><FaFolderOpen/></span>
                            <p className="text-lg font-semibold mr-1">Dataset entities</p>
                            {Object.keys(entityCounts)
                                .filter((type) => type === "Dataset" || type === "File")
                                .map((type, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                        {type}: {entityCounts[type]}
                                    </span>
                                ))}
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 sm:ml-1" onClick={() => setRocrateID("Contextual_entities")}>
                        <div className="bg-white shadow-md rounded-lg p-6 flex items-center hover:bg-gradient-to-l hover:from-[#4CAF9C] hover:to-white h-full">
                            <span className="text-4xl text-gray-500 mr-2"><AiOutlineCluster/></span>
                            <p className="text-lg font-semibold mr-1">Contextual entities</p>
                            <div className="flex flex-wrap">
                                {Object.keys(entityCounts)
                                    .filter((type) => type !== "Dataset" && type !== "File")
                                    .map((type, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 mb-1 px-2.5 py-0.5 rounded">
                                            {type}: {entityCounts[type]}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
                <MainDashboardCrate data={data} rocrate={rocrate} />
                </>
                
            ) : rocrateID === "Contextual_entities" ? (
                <EntityList rocrate={rocrate} onSelect={handleSelect} />
            ) : rocrateID === "view_dataset_overview" ? (
                <DatasetOverview rocrate={rocrate} onSelect={handleSelect} />
            ) : (
                <RocrateIDViewer rocrate={rocrate} rocrateID={rocrateID} onSelect={handleSelect} />
            )}
            
        </>
    )
}