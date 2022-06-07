//3th party imports here
import React, {useEffect,useState} from 'react';
import {DiGit} from 'react-icons/di';
import {BsInfoCircle} from 'react-icons/bs';

//css import here

function TitleHeader(props) {
  //props
  const [title, setTitle] = useState(props.title);
  const setHash = props.setHash;
  const setSelectedFile = props.setSelectedFile;
  
  //constants
  //get the current url
  const url = window.location.href;
  //get the repo name from the url
  const gitparturl = url.split('//')[1].split('/')[1];
  console.log(gitparturl);
  const githuburl = 'https://github.com/search?q='+gitparturl;
  //title header doesn't have the name of the crate in it so we need to add it in the future #TODO
  return (
    //return 2 buttons , one is for info the other is to link to github repo
    <>
      <div className="title-header">
        <div className="title-header-title" onClick={()=> {setHash("./");setSelectedFile("");window.location.reload(false);}}>
          <h1>{title}</h1>
        </div>
        <div className="title-header-buttons">
          <div className="title-header-buttons-git">
            <a href={githuburl} target="_blank"><DiGit size={30}/></a>
          </div>
          <div className="title-header-buttons-info" onClick={()=> {setHash("./");setSelectedFile("");window.location.reload(false);}}>
            <BsInfoCircle size={30}/>
          </div>
        </div>
      </div>
    </>
  );

}

export default TitleHeader;