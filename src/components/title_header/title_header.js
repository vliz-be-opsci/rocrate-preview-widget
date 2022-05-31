//3th party imports here
import React, {useEffect,useState} from 'react';
import {DiGit} from 'react-icons/di';
import {BsInfoCircle} from 'react-icons/bs';

//css import here
import './title_header.css';

function TitleHeader(props) {
  //props
  const [title, setTitle] = useState(props.title);

  //constants
  
  //title header doesn't have the name of the crate in it so we need to add it in the future #TODO
  return (
    //return 2 buttons , one is for info the other is to link to github repo
    <>
      <div className="title-header">
        <div className="title-header-title">
          <h1>{title}</h1>
        </div>
        <div className="title-header-buttons">
          <div className="title-header-buttons-git">
            <DiGit size={30}/>
          </div>
          <div className="title-header-buttons-info">
            <BsInfoCircle size={30}/>
          </div>
        </div>
      </div>
    </>
  );

}

export default TitleHeader;