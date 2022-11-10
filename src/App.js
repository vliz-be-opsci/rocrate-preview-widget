import './App.css';
import React from 'react';
import Layout from './layouts/normallayout';
import { getRocrateMetadata } from './services/constants/constants';
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
	const [mdText, setMdText] = useState('');

	//use effect that will change chcek th url if there is a fragment identifier 
	//and if there is, then it will set the current object selected to the fragment identifier
	useEffect(() => {
		if (window.location.hash) {
			console.log(window.location.hash);
			setCurrentObjectSelected(window.location.hash.substring(1));
		}
	}, []);

	//have a looker function that will detect if the hash of the url has changed 
	//and if it has then it will set the current object selected to the new hash
	useEffect(() => {
		const hashChangeHandler = () => {
			if (window.location.hash) {
				console.log(window.location.hash);
				setCurrentObjectSelected(window.location.hash.substring(1));
			}
		}
		window.addEventListener('hashchange', hashChangeHandler);
		return () => {
			window.removeEventListener('hashchange', hashChangeHandler);
		}
	}, []);
	

	//use effect that will change the window hash whenever the current object selected changes
	useEffect(() => {
		//check if the currentobjectselected has Resources/ in it
		window.location.hash = currentobjectselected;
		if (currentobjectselected.includes("Resources/")) {
			//if it does, then cut off the Resources/ part of the string
			const new_current_object_selected = currentobjectselected.substring(10);
			//set the window hash to the new current object selected
			window.location.hash = new_current_object_selected;
		}
	}, [currentobjectselected]);

	useEffect(() => {
		getTreeData(
			getRocrateMetadata, 
			setTreeInfo, 
			setOriginalTree, 
			setFullSortedData
			);
	}, [getRocrateMetadata])

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
            full_sorted_data = {full_sorted_data}
            originaltree = {originaltree}
            currentdirectory = {currentdirectory}
            setCurrentDirectory = {setCurrentDirectory}
          />
          <div id="page-wrap" className='notSideBar'>
            <div className='main_window_component'>
              <div>
				<ReadmeIsland
					getRocrateMetadata={getRocrateMetadata}
					currentobjectselected={currentobjectselected}
					mdtext = {mdText}
					setMdText = {setMdText}
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

export default App;
