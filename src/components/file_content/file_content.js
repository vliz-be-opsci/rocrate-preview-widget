//this file will contain the file content component that will displat the content of a file

const FileContentDisplay = (props) => {
    //get the file content
    const currentobjectselected = props.currentobjectselected;
    return(
        <>
            {currentobjectselected}
            <br></br>
            <a href={currentobjectselected} target="_blank" download>{currentobjectselected.split("/").pop()}</a>
        </>
    )
}

export default FileContentDisplay;