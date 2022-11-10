//import fileicons
import { File_Icon } from "../file_Icons/file_Icons";

const Tree = (props,currentObjectSelected,setCurrentObjectSelected,setTreeInfo,originaltree,currentdirectory,setCurrentDirectory) => {
    console.log(props);
    console.log(setTreeInfo);
    //map all the items that are in props 

    //function here that will be called when the user clicks on a folder
    const handleClickFolder = (event) => {
        //get the name of the folder
        const folder_name = event.target.innerText;

        //get all the nodes that are the parent of this event
        var nodes = []
        var element = event.target;
        while (element.parentNode) {
            nodes.push(element.parentNode);
            element = element.parentNode;
        }
        console.log(nodes);
        
        //loop over the nodes and console.log the inner html if the parent class has indentation 
        var all_parts = [];
        nodes.forEach((node) => {
            try {
                if (node.className.includes("indentation")) {
                    //split node id by _ and take the last element
                    all_parts.push(node.id);
                }
            } catch (error) {
                console.log(error);
            }
        })
        //reverse the all_parts array
        all_parts.reverse();
        // make new var that joins allparts by / and prepends ./
        var full_path = all_parts.join("/");
        //console.log(full_path);

        //set the current object selected to the file
        setCurrentDirectory(full_path);
        //get the folder info
        const folder_info = props.filter((item) => item.name === folder_name);
        //set the tree info to the folder info
        setTreeInfo(folder_info[0].content);
    }

    //function that will be called when the user clicks on a file
    const handleClickObject = (event,name) => {

        //TODO : find a replacement for getting the full name of the object

        //get the value of the file
        const file_name = name;

        //get all the nodes that are the parent of this event
        var nodes = []
        var element = event.target;
        while (element.parentNode) {
            nodes.push(element.parentNode);
            element = element.parentNode;
        }
        console.log(nodes);
        
        //loop over the nodes and console.log the inner html if the parent class has indentation 
        var all_parts = [];
        nodes.forEach((node) => {
            try {
                if (node.className.includes("indentation")) {
                    //split node id by _ and take the last element
                    all_parts.push(node.id);
                }
            } catch (error) {
                console.log(error);
            }
        })
        //reverse the all_parts array
        all_parts.reverse();
        // make new var that joins allparts by / and prepends ./
        var full_path = all_parts.join("/")+ file_name;

        //if currentdirectory is not . then prepend currentdirectory to full_path
        if (currentdirectory !== ".") {
            full_path = currentdirectory + "/" + full_path;
        }

        //console.log(full_path);

        //check if current object selected has Resources/ in it, if it does then remove it from the string
        if (full_path.includes("Resources/")) {
            full_path = full_path.replace("Resources/","");
        }
        //set the current object selected to the file
        setCurrentObjectSelected(full_path);
    }


    return props.map((item, index) => {
        //if the item is an object, then it is a folder
        //console.log(item);
        if (typeof item.content === "object") {
            //get the name of the folder by getting the key of the object
            const folder_name = item.name;
            //console.log(folder_name);
            //get the content of the folder by getting the value of the object
            const folder_content = item.content;
            //console.log(folder_content);
            //perform recursion on the folder content
            return (
                <div key={index} id={`${folder_name}`} className={`indentation`}>
                    <span className={`folder-sidebar open`} onClick={(e) => {handleClickFolder(e);handleClickObject(e,"")}}>{folder_name}</span>
                    {Tree(folder_content,currentObjectSelected,setCurrentObjectSelected,setTreeInfo,originaltree,currentdirectory,setCurrentDirectory)}
                </div>
            )
        }
        //if the item is a string, then it is a file
        else if (typeof item === "string") {
            //get the name of the file
            const file_name = item;
            //console.log(file_name);
            return (
                <div key={index} className={`indentation file-sidebar`} onClick={(e) => {handleClickObject(e,file_name);}}>
                    <span className="flex">{File_Icon(file_name)}{file_name}</span>
                </div>
            )
        }
    });
};

export default Tree;