export async function downloadFileFromCrate(downloadUrl: string, filename: string, encodingFormat?: string) {
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
}
