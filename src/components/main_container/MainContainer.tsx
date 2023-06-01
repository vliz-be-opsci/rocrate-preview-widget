//this file will contain all other components that wil lbe used in this project
import React, { useState, useEffect } from "react";
import RootContentTable from "../root_content_table/RootContentTable";
import RocrateMetadataTable from "../rocrate_metadata_table/RocrateMetadataTable";
import ContentNavigation from "../content_navigation/ContentNavigation";
import FolderView from "../folder_view/FolderView";
import FileViewerComponent from "../file_viewer/FileViewer";
import FileMetadataTable from "../file_metadata_table/FileMetadataTable";
import FileMenu from "../file_menu/FileMenu";
import Footer from "../footer/Footer";
import axios from "axios";

//function to extract data from the rocrate.json file
function extractData(rocrate: any) {
    //console.log(rocrate);
    let data = {};
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
    const preRocrate = props.container.attributes.rocrate.value ||{};
    const [rocrate, setRocrate] = useState(props.container.attributes.rocrate.value ||{});
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [hash, setHash] = useState("");
    const [query_params, setQueryParams] = useState("");
    const [no_q_check, setNoQCheck] = useState(0); 
    const [contents_file, setContentsFile] = useState("");

    //console.log(props.container.attributes.rocrate.value);
    //console.log(rocrate);
    //on load check if the url has a hash and if so set the hash state to it
    useEffect(() => {
        if (window.location.hash) {
            setHash(window.location.hash);
        }
    }, []);
    //on load check if the url has query params and if so set the query_params state to it
    useEffect(() => {
        if (window.location.search) {
            setQueryParams(window.location.search);
        }
    }, [no_q_check]);
    //on hash change set the hash state to the new hash
    useEffect(() => {
        window.addEventListener("hashchange", () => {
            setHash(window.location.hash);
        });
    }, []);
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

    //when hash is updated check if it is a file or folder and if it is a file set the contents_file state to it
    useEffect(() => {
        if (hash.includes("#")) {
            let hash_split = hash.split("#");
            //search in the @graph array for the file with the @id equal to the hash
            for (let i in rocrate["@graph"]) {
                let item = rocrate["@graph"][i];
                if (item["@id"] == hash_split[1]) {
                    //check if the file is a folder or a file
                    if (item["@type"] == "File") {
                        //perform a axios request to get the file contents
                        axios.get(item["contentUrl"]).then(response => {
                            //console.log the type of data recieved
                            console.log(typeof response.data);
                            //console.log(response.data);
                            setContentsFile(response.data);
                        }
                        ).catch(error => {
                            console.log(error);
                        }
                        );
                    }
                }
            }
        }
    }, [hash]);

    return (
        <div className="container rootcontainer">
            <h1 className="secondary-underline">RO-Crate to HTML Preview Widget</h1>
            <RocrateMetadataTable 
                data={data} 
                Loading={loading} 
            />
            <div className="flex_row">
                <h4>RO-Crate Content</h4>
                <FileMenu 
                    rocrate={rocrate} 
                    hash={hash} 
                    loading={loading} 
                    setNoQCheck={setNoQCheck} 
                    no_q_check={no_q_check} 
                    query_params={query_params}
                />
            </div>
            <RootContentTable 
                rocrate={rocrate} 
                hash={hash} 
                loading={loading} 
            />
            <ContentNavigation 
                rocrate={rocrate} 
                hash={hash} 
                loading={loading} 
                query_params={query_params} 
            />
            <FolderView 
                rocrate={rocrate} 
                hash={hash} 
                loading={loading} 
                query_params={query_params} 
            />
            <FileMetadataTable 
                rocrate={rocrate} 
                hash={hash} 
                loading={loading} 
            />
            <FileViewerComponent 
                rocrate={rocrate} 
                hash={hash} 
                loading={loading} 
                contents_file={contents_file}
            />
            <Footer />
        </div>
    )
}