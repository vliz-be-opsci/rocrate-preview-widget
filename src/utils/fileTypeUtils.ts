/**
 * Utility functions for detecting file types and determining if they are binary
 */

// Common binary MIME types that should not be treated as text
const BINARY_MIME_TYPES = [
    // Microsoft Office formats
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-word', // .doc
    'application/vnd.ms-powerpoint', // .ppt
    
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/ico',
    
    // Audio/Video
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-7z-compressed',
    
    // Documents
    'application/pdf',
    
    // Executables and libraries
    'application/octet-stream',
    'application/x-executable',
    'application/x-sharedlib',
    'application/x-msdownload',
];

// File extensions that are typically binary
const BINARY_EXTENSIONS = [
    '.xlsx', '.xls', '.docx', '.doc', '.pptx', '.ppt',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.ico',
    '.mp3', '.wav', '.ogg', '.mp4', '.avi', '.mov',
    '.zip', '.rar', '.tar', '.gz', '.7z',
    '.pdf',
    '.exe', '.dll', '.so', '.dylib',
];

/**
 * Determines if a file should be treated as binary based on its MIME type
 * @param mimeType The MIME type to check
 * @returns true if the file should be treated as binary
 */
export function isBinaryMimeType(mimeType: string): boolean {
    if (!mimeType) return false;
    
    // Normalize the MIME type (remove charset and other parameters)
    const normalizedMimeType = mimeType.split(';')[0].trim().toLowerCase();
    
    return BINARY_MIME_TYPES.includes(normalizedMimeType);
}

/**
 * Determines if a file should be treated as binary based on its filename/extension
 * @param filename The filename to check
 * @returns true if the file should be treated as binary
 */
export function isBinaryFilename(filename: string): boolean {
    if (!filename) return false;
    
    const lowerFilename = filename.toLowerCase();
    return BINARY_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Determines if a file should be treated as binary based on MIME type and/or filename
 * @param mimeType The MIME type (optional)
 * @param filename The filename (optional)
 * @returns true if the file should be treated as binary
 */
export function isBinaryFile(mimeType?: string, filename?: string): boolean {
    if (mimeType && isBinaryMimeType(mimeType)) {
        return true;
    }
    
    if (filename && isBinaryFilename(filename)) {
        return true;
    }
    
    return false;
}

/**
 * Checks if a MIME type represents an Excel file specifically
 * @param mimeType The MIME type to check
 * @returns true if it's an Excel file
 */
export function isExcelFile(mimeType?: string): boolean {
    if (!mimeType) return false;
    
    const normalizedMimeType = mimeType.split(';')[0].trim().toLowerCase();
    return normalizedMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
           normalizedMimeType === 'application/vnd.ms-excel';
}