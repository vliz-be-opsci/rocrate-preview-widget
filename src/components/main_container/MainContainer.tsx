//this file will contain all other components that wil lbe used in this project
import React, { useState, useEffect } from "react";
import RootContentTable from "../root_content_table/RootContentTable";
import RocrateMetadataTable from "../rocrate_metadata_table/RocrateMetadataTable";
import ContentNavigation from "../content_navigation/ContentNavigation";
import FolderView from "../folder_view/FolderView";
import ExternalFileLinksTable from "../external_file_links_table/externalFileLinksTable";
import NodesTable from "../nodes_table/nodesTable";
import FileViewerComponent from "../file_viewer/FileViewer";
import FileMetadataTable from "../file_metadata_table/FileMetadataTable";
import FileMenu from "../file_menu/FileMenu";
import Footer from "../footer/Footer";
import axios from "axios";
import {TbTableOff, TbTable} from "react-icons/tb";

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
    console.log(props.container.attributes);
    const preRocrate = props.container.attributes.rocrate.value ||{};
    const [rocrate, setRocrate] = useState(props.container.attributes.rocrate.value ||{});
    const [reponame, setRepoName] = useState(props.container.attributes.rocrate_name.value ||"");
    const [version, setVersion] = useState(props.container.attributes.version.value ||"");
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [hash, setHash] = useState("");
    const [query_params, setQueryParams] = useState("");
    const [no_q_check, setNoQCheck] = useState(0); 
    const [contents_file, setContentsFile] = useState("");
    const [showmeta, setShowMeta] = useState(false);
    const [mode, setMode] = useState("metadata");

    //console.log(props.container.attributes.rocrate.value);
    //console.log(rocrate);
    //on load check if the url has a hash and if so set the hash state to it
    useEffect(() => {
        if (window.location.hash) {
            setHash(window.location.hash);
        }
    }, []);
    //on hash change set the hash state to the new hash
    useEffect(() => {
        window.addEventListener("hashchange", () => {
            setHash(window.location.hash);
        });
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "#" + hash.replace("#", "");
        window.history.pushState({path:newurl},'',newurl);
        window.location.hash = hash;
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
                        setMode("content")
                        //perform a axios request to get the file contents
                        axios.get(item["@id"]).then(response => {
                            //console.log the type of data recieved
                            console.log(typeof response.data);
                            console.log(response.data);
                            //console.log(response.data);
                            setContentsFile(response.data);
                        }
                        ).catch(error => {
                            console.log(error);
                        }
                        );
                    }
                    if (item["@type"] != "File" && item["@type"] != "Dataset") {
                        setMode("metadata");
                    }
                }
            }
        }
    }, [hash]);

    //function that will show or hide the metadata table and change the icon id for table is rocrate_metadata_table , id for button is eyebutton
    const showHideMetadata = () => {
        if (showmeta) {
            setShowMeta(false);
        } else {
            setShowMeta(true);
        }
    }

    return (
        <div className="container rootcontainer">
            <div className="flex_row">
                <h1 className="secondary-underline">{reponame} version {version} rocrate preview</h1>
                <button className="file_menu_button" id="eyebutton" onClick={() => showHideMetadata()}>
                    {
                        showmeta ?
                        <TbTableOff />
                        : <TbTable />
                    }
                </button>
            </div>
            <br />
            {
                showmeta ?
                <RocrateMetadataTable 
                    data={data} 
                    Loading={loading} 
                />
                : null
            }
            <div className="flex_row">
                <ContentNavigation 
                    rocrate={rocrate} 
                    hash={hash} 
                    loading={loading} 
                    query_params={query_params} 
                />
                <FileMenu 
                    rocrate={rocrate} 
                    hash={hash} 
                    loading={loading} 
                    query_params={query_params}
                    setmode={setMode}
                    mode={mode}
                />
            </div>
            <RootContentTable 
                rocrate={rocrate} 
                hash={hash} 
                loading={loading} 
            />
            {
                hash.includes("metadata_nodes") ?
                <NodesTable
                    rocrate={rocrate}
                    hash={hash}
                    loading={loading}
                />
                : 
                hash.includes("resource_uris") ?
                <ExternalFileLinksTable
                    rocrate={rocrate}
                    hash={hash}
                    loading={loading}
                />
                :
                <>
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
                        mode={mode}
                    />
                    <FileViewerComponent 
                        rocrate={rocrate} 
                        hash={hash} 
                        loading={loading} 
                        contents_file={contents_file}
                        mode={mode}
                    />
                </>
            }
            
            <Footer />
        </div>
    )
}