//this file will contain all functions that are used to manipulate the file system
//these functions will be only temp and wil prob not be used in the final product that will be deployed

//this function will open a file on the system relative to the root of the project
//the file will be opened in the default application for that file type
const openFile = (filepath) => {
    //open the file
    shell.openPath(filepath);
}

//export all necessary functions
export { openFile };