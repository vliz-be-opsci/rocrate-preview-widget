//this component will render a readme file when the given folders direct child contains a readme file , else it will just render the folder name
import ReactMarkdown from "react-markdown";
const ReadmeIsland = (props) => {
    const getRocrateMetadata = props.getRocrateMetadata;
    const currentdirectory = props.currentdirectory;
    console.log(props.setMdText("test"));
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

    return (
        <>
            {checkIfReadmeExists(currentdirectory) == true ? <div className="readme-island">
                <h3>{currentdirectory}</h3>
                <div className="readme-content">
                    <ReactMarkdown>{props.mdtext}</ReactMarkdown>
                </div>
            </div> : <>no README.md file in {currentdirectory}</>}
        </>
    )
}

export default ReadmeIsland;