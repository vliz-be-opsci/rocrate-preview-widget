//this component will render a readme file when the given folders direct child contains a readme file , else it will just render the folder name
import ReactMarkdown from "react-markdown";
const ReadmeIsland = (props) => {
    const getRocrateMetadata = props.getRocrateMetadata;
    const currentdirectory = props.currentdirectory;

    //function here that will check if the readme file exists in the foldername given 
    const checkIfReadmeExists = (foldername) => {
        //go over each item in the rocrate metadata
        const graph = getRocrateMetadata["@graph"];
		graph.forEach((item) => {
			//check if the item is of type dataset and if the @id of the item is the same as the foldername
            if (item["@type"] === "Dataset" && item["@id"] === foldername + "/") {
                
                //check if the hasPart of the dataset contains a readme file
                const hasPart = item["hasPart"];
                //loop over the hasPart array
                for (let i = 0; i < hasPart.length; i++) {
                    if (hasPart[i]["@id"].includes("README.md") ) {
                        //if it is then return true
                        return true;
                    }
                }
            }
		})
    }

    return (
        <>
            {checkIfReadmeExists(currentdirectory) == true ? <div className="readme-island">
                <h1>Readme</h1>
                <div className="readme-content">
                    <ReactMarkdown>{props.readme}</ReactMarkdown>
                </div>
            </div> : <>no readme file in {currentdirectory}</>}
        </>
    )
}

export default ReadmeIsland;