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
	const [Loading, setLoading] = useState(true);

	//use effect that will change chcek th url if there is a fragment identifier 
	//and if there is, then it will set the current object selected to the fragment identifier
	useEffect(() => {
		getJSONLD(path_url_string, setLoading,setGetRocrateMetadata);
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
		//check if the currentobjectselected has Resources/ in it
		if (new_current_object_selected.includes("Resources/")) {
			//if it does, then cut off the Resources/ part of the string
			new_current_object_selected = new_current_object_selected.substring(10);
		}
		const encoded_new_current_object_selected = new_current_object_selected;
		console.log(encoded_new_current_object_selected);
		window.location.hash = encoded_new_current_object_selected;
	}, [currentobjectselected]);

	useEffect(() => {
		if (!Loading) {
			getTreeData(
				getRocrateMetadata, 
				setTreeInfo, 
				setOriginalTree, 
				setFullSortedData,
				searchterm
				);
		}
	}, [getRocrateMetadata,Loading])

 //if loading then return loading
	
	if (Loading) {
		return (
			<div>
				<h1>Loading</h1>
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
