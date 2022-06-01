//3th party imports here
import React, {useEffect,useState} from 'react';

//component inports here
import TitleHeader from '../../components/title_header/title_header';
import Sidebar from '../../components/sidebar/sidebar';
import FilePanel from '../../components/file_panel/file_panel';

//import util functions here
import { extract_data_files, create_data_file_paths } from '../../utils/rocrate_metadata_functions';

//css import here
import './homepage.css';

const mime = require('mime');

function HomePage() {
  //constants
  const [dataFiles, setDataFiles] = useState([]);
  const [dataFilePaths, setDataFilePaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentdirectory, setCurrentDirectory] = useState('./');
  const [currentbreadcrumb, setCurrentBreadcrumb] = useState('./');
  const [lastdirectory, setLastDirectory] = useState('');
  const [lastbreadrumb, setLastBreadcrumb] = useState('');
  const [selectedfile, setSelectedFile] = useState('');
  const url = window.location.href;
  const reponame = url.split('//')[1].split('/')[1];
  console.log(currentbreadcrumb);
  console.log(selectedfile);
  console.log(currentdirectory);
  //import the rocrate-metadata-json file and store it in a variable
  const metadata = require('../../tocopy/ro-crate-metadata.json');

  //perform functions here
  

  // dismantle the metadata object and store it in variables
  const profile_conforms_to = metadata["@context"];
  console.log(dataFiles);
  console.log(dataFilePaths);
  console.log(loading);
  useEffect(() => {
    extract_data_files(metadata, setDataFiles, setLoading);
    create_data_file_paths(metadata, setDataFilePaths);
  }, []);

  //if loading is true return loading
  if (loading) {
    return(
      <>
        loading
      </>
      )
  }else{
    return (
      <>
      <div class="teamcard">
        <div class="title-bar">
          <TitleHeader title={reponame}/>
        </div>
        <div class="breadcrumb-bar blue">
          <h3>{currentbreadcrumb}</h3>
        </div>
        <div class="search-bar">

        </div>
        <div class="navigation-sidebar">
          <Sidebar 
            dataFiles={dataFiles} 
            dataFilePaths={dataFilePaths} 
            setSelectedFile={setSelectedFile} 
            setCurrentDirectory={setCurrentDirectory} 
            setLastDirectory={setLastDirectory} 
            metadata={metadata} 
            lastdirectory={lastdirectory} 
            currentdirectory={currentdirectory} 
            setCurrentBreadcrumb={setCurrentBreadcrumb}
            currentbreadcrumb={currentbreadcrumb}
            lastbreadrumb={lastbreadrumb}
            setLastBreadcrumb={setLastBreadcrumb}
          />
        </div>
        <div class="object-preview-panel">
          <FilePanel 
            selectedfile={selectedfile} 
            currentdirectory={currentdirectory} 
            dataFilePaths={dataFilePaths}
            dataFiles={dataFiles}
            setSelectedFile={setSelectedFile}
          ></FilePanel>
        </div>
      </div>
      </>
    );
  }
  

}

export default HomePage;