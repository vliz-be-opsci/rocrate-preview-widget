//this component will contain all the icons for the file types available
import {FaFile, FaFolder, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFilePdf, FaFileImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaFileAlt} from 'react-icons/fa';
import {MdHttp} from 'react-icons/md';

//export function that will take in the name of the file and then determine the icon to use
export function File_Icon(name) {
    //first determine if the file is a folder or a file
    //if the file is a folder, then return the folder icon
    //the file is a folder if the name does not have a . in ot
    if (name.indexOf(".") === -1) {
        return <div className="file_icon_sidebar"><FaFolder /></div>;
    }

    //if the filename contains http then return the http icon
    if (name.indexOf("http") !== -1) {
        return <div className="file_icon_sidebar"><MdHttp /></div>;
    }

    //if the file is not a folder, then determine the file type
    //get the file extension
    let file_extension = name.split('.').pop();
    //check the file extension and return the appropriate icon
    switch (file_extension) {
        case "pdf":
            return <div className="file_icon_sidebar"><FaFilePdf></FaFilePdf></div>
        case "doc":
        case "docx":
            return <div className="file_icon_sidebar"><FaFileWord></FaFileWord></div>
        case "xls":
        case "xlsx":
            return <div className="file_icon_sidebar"><FaFileExcel></FaFileExcel></div>
        case "ppt":
        case "pptx":
            return <div className="file_icon_sidebar"><FaFilePowerpoint></FaFilePowerpoint></div>
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "svg":
            return <div className="file_icon_sidebar"><FaFileImage></FaFileImage></div>
        case "mp4":
        case "avi":
        case "mov":
        case "wmv":
        case "flv":
        case "mkv":
            return <div className="file_icon_sidebar"><FaFileVideo></FaFileVideo></div>
        case "mp3":
        case "wav":
        case "wma":
        case "ogg":
        case "flac":
            return <div className="file_icon_sidebar"><FaFileAudio></FaFileAudio></div>
        case "zip":
        case "rar":
        case "7z":
        case "tar":
        case "gz":
        case "bz2":
            return <div className="file_icon_sidebar"><FaFileArchive></FaFileArchive></div>
        case "js":
        case "html":
        case "css":
        case "py":
        case "java":
        case "c":
        case "cpp":
        case "cs":
        case "go":
        case "php":
        case "rb":
        case "swift":
        case "ts":
        case "json":
        case "xml":
        case "sql":
        case "sh":
        case "bat":
        case "pl":
        case "ps1":
        case "psm1":
        case "psd1":
        case "ps1xml":
        case "psc1":
        case "psrc":
            return <div className="file_icon_sidebar"><FaFileCode></FaFileCode></div>
        default:
            return <div className="file_icon_sidebar"><FaFileAlt></FaFileAlt></div>
    }
}