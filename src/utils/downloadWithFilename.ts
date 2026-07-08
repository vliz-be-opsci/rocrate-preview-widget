const MIME_TO_EXTENSION: { [key: string]: string } = {
    'application/pdf': '.pdf',
    'text/html': '.html',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'application/json': '.json',
    'application/x-bzip2': '.bz2',
    'text/plain': '.txt',
    'text/xml': '.xml',
    'application/zip': '.zip',
    'audio/mpeg': '.mp3',
    'video/mp4': '.mp4',
};

export function getExtensionFromMimeType(mimeType: string): string {
    if (!mimeType) return "";
    const normalized = mimeType.split(';')[0].trim().toLowerCase();
    return MIME_TO_EXTENSION[normalized] || "";
}

export function resolveFilename(itemId: string, downloadUrl: string, name?: string, encodingFormat?: string): string {
    const getFilenameFromPath = (pathStr: string) => {
        if (!pathStr) return "";
        const pathWithoutQuery = pathStr.split("?")[0];
        return pathWithoutQuery.split("/").pop() || "";
    };

    const idFilename = getFilenameFromPath(itemId);
    const urlFilename = getFilenameFromPath(downloadUrl);
    const nameFilename = name ? getFilenameFromPath(name) : "";

    let filename = "";

    // Prefer idFilename if it has an extension (a dot)
    if (idFilename && idFilename.includes(".")) {
        filename = idFilename;
    } else if (nameFilename && nameFilename.includes(".")) {
        filename = nameFilename;
    } else if (urlFilename && urlFilename.includes(".")) {
        filename = urlFilename;
    } else {
        filename = idFilename || urlFilename || nameFilename || "download.txt";
    }

    // Append extension if filename doesn't have a dot and we have encodingFormat
    if (!filename.includes(".") && encodingFormat) {
        const ext = getExtensionFromMimeType(encodingFormat);
        if (ext) {
            filename += ext;
        }
    }

    return filename;
}

export async function downloadFileFromCrate(
    downloadUrl: string,
    itemId: string,
    name?: string,
    encodingFormat?: string
) {
    const filename = resolveFilename(itemId, downloadUrl, name, encodingFormat);
    
    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Failed to fetch file");
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(
            encodingFormat ? new Blob([await blob.arrayBuffer()], { type: encodingFormat }) : blob
        );
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.warn("CORS/network error during fetch download, falling back to direct link:", error);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
}
