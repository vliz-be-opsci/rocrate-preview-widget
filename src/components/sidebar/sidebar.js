import React from 'react';
import { push as Menu } from 'react-burger-menu';
import Tree from '../tree/tree';
import { getTreeData } from '../../services/utils/filefunctions';
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
		getTreeData(
			props.rocrateinfo,
			props.setTreeInfo,
			props.setOriginalTree,
			props.setFullSortedData,
			search_term
		)

	}

  return (
    <>
    <Menu pageWrapId={'page-wrap'} outerContainerId={ "outer-container" } width={ '22%' }>
		<h1>Rocrate Contents</h1>
		<div className='flex'>
			<input type="text" placeholder="Search" onChange={(e) => handleSearch(e)} />
		</div>{props.currentdirectory !== "." ? <div className='folder-sidebar'>{props.currentdirectory}</div> : <></>}
      	{Tree(props.treeinfo,props.currentobjectselected,props.setCurrentObjectSelected,props.setTreeInfo,props.originaltree,props.currentdirectory,props.setCurrentDirectory)}
    </Menu>
    </> 
  );
};

export default SideBar;