import { resolveFilename, getExtensionFromMimeType } from "./downloadWithFilename";

describe("downloadWithFilename utils", () => {
    test("getExtensionFromMimeType maps correctly", () => {
        expect(getExtensionFromMimeType("application/pdf")).toBe(".pdf");
        expect(getExtensionFromMimeType("application/x-bzip2")).toBe(".bz2");
        expect(getExtensionFromMimeType("unknown/mime")).toBe("");
    });

    test("resolveFilename prioritizes @id with extension", () => {
        expect(resolveFilename(
            "final.contigs.fa.bz2",
            "https://s3.mesocentre.uca.fr/mgf-data-products/files/md5/05/0728f07d367caca78fb0de48630d8c",
            "FASTA formatted contig sequences",
            "application/x-bzip2"
        )).toBe("final.contigs.fa.bz2");
    });

    test("resolveFilename appends extension if missing", () => {
        expect(resolveFilename(
            "no-extension-id",
            "https://s3.amazonaws.com/my-bucket/uuid-123",
            "My Document",
            "application/pdf"
        )).toBe("no-extension-id.pdf");
    });
});
