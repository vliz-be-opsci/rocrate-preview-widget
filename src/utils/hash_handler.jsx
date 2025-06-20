//this file will contain all functions that will handle uri hash changes

//function to get the hash from the uri
export function getHash() {
    return window.location.hash;
}

//function to set the hash in the uri
export function setHash(rocrateid) {
    window.location.hash = `#crateid=${rocrateid}`;
}

export function tryExtractWindowQueryParam(query_params) {
    try {
        const match = query_params.match(/#crateid=([^&]*)/);
        return match ? match[1] : "metadata";
    } catch {
        return "metadata";
    }
}