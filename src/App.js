import './App.css';
import React from 'react';
import Layout from './layouts/normallayout';
import { path_url_string, getJSONLD } from './services/constants/constants';
import { getTreeData } from './services/utils/filefunctions';
import FileContentDisplay from './components/file_content/file_content';
import SideBar from './components/sidebar/sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BiGitBranch} from 'react-icons/bi';
import {FaArchive} from 'react-icons/fa';
import {useState, useEffect} from 'react';
import ReadmeIsland from './components/readme_island/readme_island';

function App() {
	const [currentobjectselected, setCurrentObjectSelected] = useState("");
  	const [treeinfo, setTreeInfo] = useState([]);
	const [searchterm, setSearchTerm] = useState("");
	const [full_sorted_data, setFullSortedData] = useState([]);
	const [originaltree, setOriginalTree] = useState([]);
	const [currentdirectory, setCurrentDirectory] = useState(".");
	const [currentWindowDisplay, setCurrentWindowDisplay] = useState("overview");
	const [getRocrateMetadata, setGetRocrateMetadata] = useState("");
	const [mdText, setMdText] = useState('');
	const [ShowMd, setShowMd] = useState(false);
	const [Loading, setLoading] = useState(true);
	const [Error, setError] = useState(false);

	//use effect that will change chcek th url if there is a fragment identifier 
	//and if there is, then it will set the current object selected to the fragment identifier
	useEffect(() => {
		getJSONLD(path_url_string, setLoading,setGetRocrateMetadata, setError);
	}, []);

	useEffect(() => {
		if (window.location.hash) {
			console.log(window.location.hash);
			let object_id = window.location.hash.substring(1);
			console.log(object_id);
			setCurrentObjectSelected(object_id);
			return;
		}
		setCurrentObjectSelected("");
	}, []);

	//have a looker function that will detect if the hash of the url has changed 
	//and if it has then it will set the current object selected to the new hash
	useEffect(() => {
		const hashChangeHandler = () => {
			console.log(window.location.hash);
			if (window.location.hash) {
				console.log(window.location.hash);
				setCurrentObjectSelected(window.location.hash.substring(1));
				return;
			}
			console.log("no hash in url");
			setCurrentObjectSelected("");
			return;
		}
		window.addEventListener('hashchange', hashChangeHandler);
		return () => {
			window.removeEventListener('hashchange', hashChangeHandler);
		}
	}, []);
	//use effect that will change the window hash whenever the current object selected changes
	useEffect(() => {
		let new_current_object_selected = currentobjectselected;
		//check if new_current_object_selected is empty
		if (new_current_object_selected === "") {
			return;
		}

		//if first 2 char of new_current_object_selected is not  ./ then add them
		if (new_current_object_selected.substring(0, 2) !== "./") {
			//check if http is in the string or if the string starts with _:
			if (!new_current_object_selected.includes("http") && !new_current_object_selected.substring(0, 2) === "_:") {
				new_current_object_selected = "./" + new_current_object_selected;
			}
			setCurrentObjectSelected(new_current_object_selected);
			return;
		}
		//check if the new_current_object_selected contains a ./ at the start
		if (new_current_object_selected.substring(0, 2) === "./") {
			//split the new_current_object_selected by the ./ and check if the array length is 2
			let split_array = new_current_object_selected.split("./");
			if (split_array.length === 2) {
				window.location.hash = new_current_object_selected;
				return;
			}
			//if the array length is bigger then 2 then take the last part and prepend ./ to it and set this as the new_current_object_selected
			new_current_object_selected = "./" + split_array[split_array.length - 1];
			setCurrentObjectSelected(new_current_object_selected);
			return;
		}
		//check if the currentobjectselected has Resources/ in it
		if (new_current_object_selected.includes("Resources/")) {
			//if it does, then cut off the Resources/ part of the string
			new_current_object_selected = new_current_object_selected.substring(10);
			setCurrentObjectSelected(new_current_object_selected);
		}
		const encoded_new_current_object_selected = new_current_object_selected;
		console.log(encoded_new_current_object_selected);
		window.location.hash = encoded_new_current_object_selected;
	}, [currentobjectselected]);

	useEffect(() => {
		setShowMd(false);
		if (!Loading) {
			getTreeData(
				getRocrateMetadata, 
				setTreeInfo, 
				setOriginalTree, 
				setFullSortedData,
				searchterm
				);
		}
		if (!Loading && getRocrateMetadata == "") {
			setError(true);
		}
	}, [getRocrateMetadata,Loading])

 //if loading then return loading
	if (Error) {
		return(
			<div>
				<h1>Error</h1>
				<h3>Something went wrong when loading in rocrate-metadata.json</h3>
			</div>
		)
	}
	if (Loading) {
		return (
			<div>
				<h1>Loading ro-crate-metadata.json info</h1>
			</div>
		)
	}
	else{
		return (
			<div id="App">
			  <Layout>
				<div className="App" id="outer-container">
				  <SideBar 
					setCurrentObjectSelected={setCurrentObjectSelected} 
					currentobjectselected={currentobjectselected}
					rocrateinfo={getRocrateMetadata} 
					treeinfo={treeinfo} 
					setTreeInfo={setTreeInfo}
					searchterm={searchterm} 
					setSearchTerm={setSearchTerm} 
					full_sorted_data={full_sorted_data}
					originaltree={originaltree}
					currentdirectory={currentdirectory}
					setCurrentDirectory={setCurrentDirectory}
					setOriginalTree={setOriginalTree}
					setFullSortedData={setFullSortedData}
				  />
				  <div id="page-wrap" className='notSideBar'>
					<div className='main_window_component'>
					  <div>
						<ReadmeIsland
							getRocrateMetadata={getRocrateMetadata}
							currentobjectselected={currentobjectselected}
							mdtext={mdText}
							setMdText={setMdText}
							setShowMd={setShowMd}
							ShowMd={ShowMd}
						/>
						<FileContentDisplay
							currentobjectselected={currentobjectselected}
							setCurrentObjectSelected={setCurrentObjectSelected}
							rocrateinfo={getRocrateMetadata}
						/>
					  </div>
					</div>
				  </div>
				  <div className='mini_dashboard'>
						<div onClick={(e) => {setCurrentWindowDisplay("archive");console.log(currentWindowDisplay)}} className='dashboardicon archiveicon'><FaArchive /></div>
						<div onClick={(e) => {setCurrentWindowDisplay("git");console.log(currentWindowDisplay)}} className='dashboardicon gitbranchicon'><BiGitBranch /></div>
				  </div>
				</div>
			  </Layout>
			</div>
		  );
	}
}

export default App;
