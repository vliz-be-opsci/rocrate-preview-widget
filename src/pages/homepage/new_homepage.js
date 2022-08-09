//3th party imports here
import React, {useEffect,useState} from 'react';
import {Alert} from 'react-bootstrap';
import {AiFillFolderOpen} from 'react-icons/ai';

//component inports here
import TitleHeader from '../../components/title_header/title_header';
import Sidebar from '../../components/sidebar/sidebar';
import FilePanel from '../../components/file_panel/file_panel';

//import util functions here
import { extract_data_files, create_data_file_paths, define_constants_from_fragment_identifier } from '../../utils/rocrate_metadata_functions';

//css import here
import './homepage.css';

const mime = require('mime');

//side function here
const useHash = () => {
  const [hash, setHash] = React.useState(() => window.location.hash);

  const hashChangeHandler = React.useCallback(() => {
    setHash(window.location.hash);
  }, []);

  React.useEffect(() => {
    window.addEventListener('hashchange', hashChangeHandler);
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler);
    };
  }, []);

  const updateHash = React.useCallback(
    newHash => {
      if (newHash !== hash) window.location.hash = newHash;
    },
    [hash]
  );

  return [hash, updateHash];
};

function HomePage() {
  //constants
  const [dataFiles, setDataFiles] = useState([]);
  const [dataFilePaths, setDataFilePaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentdirectory, setCurrentDirectory] = useState('./');
  const [currentbreadcrumb, setCurrentBreadcrumb] = useState('./');
  const [lastdirectory, setLastDirectory] = useState('');
  const [lastbreadcrumb, setLastBreadcrumb] = useState('');
  const [selectedfile, setSelectedFile] = useState('');
  const [errorhash, setErrorHash] = useState(false);
  const [hash, setHash] = useHash();
  const url = window.location.href;
  var reponame = url.split('//')[1].split('/')[1];
  reponame = reponame.split('#')[0];
  //const reponame = "test";
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
    setHash(window.location.hash.substring(1));
    define_constants_from_fragment_identifier(hash, setCurrentDirectory, setCurrentBreadcrumb, setSelectedFile, setLastDirectory, setErrorHash);
    extract_data_files(metadata, setDataFiles, setLoading, setDataFilePaths);
    //create_data_file_paths(metadata, setDataFilePaths);
  }, []);

  //child function that will display an error if a wrong fragment identifier is used
  function ErrorHash(props) {
    if (errorhash) {
      return(
        <Alert variant="danger" onClose={() => setErrorHash(false)} dismissible>
          <div className="errorhash">
            <Alert.Heading>The fragment identifier is not valid. Please use the following format:</Alert.Heading>
            <p>
              <span className="fragment-identifier-example">
                #<span className="fragment-identifier-example-text">
                  <span className="fragment-identifier-example-text-bold">
                    ./folder_path/to/file
                  </span>
                  <span className="fragment-identifier-example-text-bold">
                    /
                  </span>
                  <span className="fragment-identifier-example-text-bold">
                    data-file-name.extention
                  </span>
                </span>
              </span>
            </p>
          </div>
        </Alert>
      );
    }else{
      return (<></>);
    }
  }

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
          <TitleHeader title={reponame} setHash={setHash} setSelectedFile={setSelectedFile}/>
        </div>
        <div class="breadcrumb-bar">
          <div className='breadcrumb-contents' onClick={()=> {setHash(currentbreadcrumb);setSelectedFile("");}}><AiFillFolderOpen></AiFillFolderOpen>: {currentbreadcrumb}</div>
          <ErrorHash/>
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
            lastbreadcrumb={lastbreadcrumb}
            setLastBreadcrumb={setLastBreadcrumb}
            setHash={setHash}
          />
        </div>
        <div class="object-preview-panel">
          <FilePanel 
            selectedfile={selectedfile} 
            currentdirectory={currentdirectory} 
            dataFilePaths={dataFilePaths}
            dataFiles={dataFiles}
            setSelectedFile={setSelectedFile}
            currentbreadcrumb={currentbreadcrumb}
          ></FilePanel>
        </div>
      </div>
      </>
    );
  }
  

}

export default HomePage;