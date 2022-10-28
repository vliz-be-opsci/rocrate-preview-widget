import React from 'react';
import { push as Menu } from 'react-burger-menu';
import Tree from '../Tree/Tree';
import { useState, useEffect } from 'react';

const SideBar = (props) => {
	console.log(props);

	//function that will be called when the user types in the search bar
	const handleSearch = (event) => {
		//get the value of the search bar
		const search_term = event.target.value;
		//set the search term to the value of the search bar
		props.setSearchTerm(search_term);
		//if the search term is empty, then set the tree info to the folder info
		if (search_term === "") {
			props.setTreeInfo(props.treeinfo);
		}
	}

  return (
    <>
    <Menu pageWrapId={'page-wrap'} outerContainerId={ "outer-container" } width={ '22%' }>
		<h1>Rocrate Contents</h1>
		<div className='flex'>
			<input type="text" placeholder="Search" onChange={(e) => handleSearch(e)} />
			<button onClick={() => props.setTreeInfo(props.originaltree)}>Reset</button>
		</div>
      {Tree(props.treeinfo,props.currentobjectselected,props.setCurrentObjectSelected,props.setTreeInfo,props.originaltree)}
    </Menu>
    </> 
    
  );
};

export default SideBar;