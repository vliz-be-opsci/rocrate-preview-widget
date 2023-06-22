//this file will provide a function that will return the correct class for a given file name
//this is used to determine which previewer to use for a given file
//the catergories are:
//  - pdf
//  - image
//  - video
//  - audio
//  - text
//  - code
//  - other

export function getPreviewerClass(fileName: string): any {
    //get the file extension
    let fileExtension = fileName.split('.').pop();
    //return the correct class
    switch (fileExtension) {
        case 'pdf':
            return 'pdf'
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'ico':
        case 'tif':
        case 'tiff':
        case 'webp':
            return 'image'
        case 'mp4':
        case 'webm':
            return 'video'
        case 'mp3':
        case 'wav':
        case 'ogg':
            return 'audio'
        case 'txt':
        case 'md':
            return 'text'
        case 'js':
        case 'ts':
        case 'py':
        case 'c':
        case 'cpp':
        case 'h':
        case 'cs':
        case 'css':
        case 'html':
        case 'xml':
        case 'json':
        case 'yaml':
        case 'yml':
        case 'sh':
        case 'bat':
        case 'ps1':
        case 'psm1':
        case 'psd1':
        case 'ps1xml':
        case 'psc1':
        case 'pssc':
        case 'cdxml':
        case 'xaml':
        case 'msh':
        case 'msh1':
        case 'msh2':
        case 'mshxml':
        case 'msh1xml':
        case 'msh2xml':
        case 'scf':
        case 'vbs':
        case 'wsf':
        case 'config':
        case 'reg':
        case 'csv':
        case 'log':
        case 'ini':
        case 'inf':
        case 'url':
        case 'lnk':
        case 'desktop':
        case 'psd':
        case 'psb':
        case 'psdt':
        case 'psdx':
        case 'psp':
        case 'pdd':
        case 'ai':
        case 'eps':
        case 'indd':
        case 'indl':
        case 'indt':
        case 'indb':
        case 'inx':
        case 'idml':
        case 'pmd':
            return 'code'
        case 'ppt':
        case 'pptx':
        case 'pptm':
        case 'pot':
        case 'potx':
        case 'potm':
        case 'pps':
        case 'ppsx':
        case 'ppsm':
        case 'ppa':
        case 'ppam':
            return 'powerpoint'
        default:
            return 'other'
    }
}