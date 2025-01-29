//this file will contain all other components that wil lbe used in this project
import * as React from "react";
import { useState, useEffect } from "react";
import { FaFolder } from "react-icons/fa";
import { PiGraphFill } from "react-icons/pi";
import SearchComponent from "./SearchComponent";
import Breadcrumb from "./Breadcrumb";
import RocrateIDViewer from "./RocrateIDViewer";
//function to extract data from the rocrate.json file
function extractData(rocrate: any) {
    //console.log(rocrate);
    let data: { [key: string]: any } = {};
    data["rocrate_context"] = rocrate["@context"];

    //loop over the @graph array and check if the @id is "./" or "ro-crate-metadata.json"
    for (let i in rocrate["@graph"]) {
        let item = rocrate["@graph"][i];
        console.log(item);
        if (item["@id"] == "./") {
            //check if the following attributs exists ["author", "datePublished", "description", "keywords", "license"] if not set them to None
            data["rocrate_author"] = item["author"] || "None";
            data["rocrate_datePublished"] = item["datePublished"] || "None";
            data["rocrate_description"] = item["description"] || "None";
            data["rocrate_keywords"] = item["keywords"] || "None";
            data["rocrate_license"] = item["license"] || "None";
        }

        if (item["@id"] == "ro-crate-metadata.json") {
            //check if @type is a string or list and if it is a list check if Profile is in the list , also get the @id of the conforms to 
            if (typeof item["@type"] == "object") {
                if (item["@type"].includes("Profile")) {
                    data["rocrate_isprofile"] = true;
                }
                else {
                    data["rocrate_isprofile"] = false;   
                }
            }
            data["rocrate_conformsto"] = item["conformsTo"]["@id"];
        }
        i = i + 1;
    }
    //console.log(data);
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

    const handleSelect = (id: string) => {
        setRocrateID(id);
    };

    //perform the get request to get the rocrate.json file
    useEffect(() => {
        if (preRocrate.includes(".json")) {
            fetch(preRocrate)
                .then(response => response.json())
                .then(jsondata => setRocrate(jsondata))
                .then(() => setLoading(false));
        }else{
            setRocrate(preRocrate);
        }
    }, [preRocrate]);
    //when rocrate is updated extract the data from it
    useEffect(() => {
        setData(extractData(rocrate));
    }, [rocrate]);

    if (loading || Object.keys(rocrate).length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <br/>
            <div className="flex flex-row justify-between items-center">
                <Breadcrumb rocrate={rocrate} rocrateID={rocrateID} reponame={reponame} onSelect={handleSelect} />
                <SearchComponent rocrate={rocrate} onSelect={handleSelect} />
            </div>
            <br />
            {rocrateID === "" ? (
                <div className="flex flex-wrap">
                    <div className="w-full sm:w-1/2 p-4" onClick={() => setRocrateID("./")}>
                        <div className="bg-white shadow-md rounded-lg p-6 flex items-center hover:bg-gradient-to-l hover:from-[#4CAF9C] hover:to-white">
                            <FaFolder className="text-4xl text-gray-500 mr-2"/>
                            <p className="text-lg font-semibold">Dataset files</p>
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 p-4" onClick={() => setRocrateID("Dataset entities")}>
                        <div className="bg-white shadow-md rounded-lg p-6 flex items-center hover:bg-gradient-to-l hover:from-[#4CAF9C] hover:to-white">
                            <PiGraphFill className="text-4xl text-gray-500 mr-2"/>
                            <p className="text-lg font-semibold">Dataset entities</p>
                        </div>
                    </div>
                </div>
                
            ) : (
                <RocrateIDViewer rocrate={rocrate} rocrateID={rocrateID} onSelect={handleSelect} />
            )}
        </>
    )
}