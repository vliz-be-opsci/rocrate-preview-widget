//this component will render a readme file when the given folders direct child contains a readme file , else it will just render the folder name
import ReactMarkdown from "react-markdown";
const ReadmeIsland = (props) => {
    console.log(props);
    const getRocrateMetadata = props.getRocrateMetadata;
    const currentobjectselected = props.currentobjectselected;
    const currentdirectory_pre = currentobjectselected.split("/");
    const currentdirectory = currentdirectory_pre.slice(0, currentdirectory_pre.length - 1).join("/");
    //function here that will check if the readme file exists in the foldername given 
    const checkIfReadmeExists = (foldername) => {
        //go over each item in the rocrate metadata
        const graph = getRocrateMetadata["@graph"];
        let check = false;
		graph.forEach((item) => {
			//check if the item is of type dataset and if the @id of the item is the same as the foldername
            if (item["@type"] === "Dataset" && item["@id"] === foldername + "/") {
                //check if the hasPart of the dataset contains a readme file
                const hasPart = item["hasPart"];
                //loop over the hasPart array
                for (let i = 0; i < hasPart.length; i++) {
                    //console.log(hasPart[i]["@id"]);
                    //check if hasPart[i]["@id"] contains substring README
                    const checkstring = hasPart[i]["@id"];
                    const substring = "README.md";
                    if (hasPart[i]["@id"].indexOf("README.md") !== -1) {
                        //console.log("readme file exists");
                        //if it is then return true 
                        check = true;
                        fetch(checkstring)
                        .then((response) => {
                            if (response.ok) return response.text();
                            else return Promise.reject("Didn't fetch text correctly");
                        })
                        .then((text) => {
                            props.setMdText(text);
                        })
                        .catch((error) => console.error(error));
                    }
                }
            }
		})
        return check;
    }    
    console.log(currentdirectory);
    //function here that will change the classname of the titlebar-readme to titlebar-readme titlebar-active or titlebar-readme titlebar-inactive
    const changeClassname = () => {
        const titlebar = document.getElementsByClassName("titlebar-readme");
        const readmecontent = document.getElementsByClassName("readme-content");
        //check if titlebar has the class titlebar-active if not then add it and delete the class titlebar-inactive, or vice versa
        if (titlebar[0].classList.contains("titlebar-active")) {
            titlebar[0].classList.remove("titlebar-active");
            titlebar[0].classList.add("titlebar-inactive");
            titlebar[0].innerHTML = `Show Readme of folder: ${currentdirectory}`;
            readmecontent[0].classList.remove("fade-in");
            readmecontent[0].classList.add("fade-out");
        } else {
            titlebar[0].classList.remove("titlebar-inactive");
            titlebar[0].classList.add("titlebar-active");
            titlebar[0].innerHTML = `Hide Readme of folder: ${currentdirectory}`;
            readmecontent[0].classList.remove("fade-out");
            readmecontent[0].classList.add("fade-in");
        }
    }

    if(props.ShowMd){
        return(
        <>
            {checkIfReadmeExists(currentdirectory) == true ? 
                <div className="readme-island">
                    <h3 onClick={(e)=> {changeClassname()}} className="titlebar-readme titlebar-inactive">Show Readme of folder: {currentdirectory}</h3>
                    <div className="readme-content fade-out">
                        <ReactMarkdown>{props.mdtext}</ReactMarkdown>
                    </div>
                </div> 
            : 
                <>
                </>
            }
        </>
        )
    }

    return (
        <></>
    )
}

export default ReadmeIsland;