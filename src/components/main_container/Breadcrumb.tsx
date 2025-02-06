import React, { useState } from "react";
import { FaFolder, FaFile, FaHome } from "react-icons/fa";
import { PiGraphFill } from "react-icons/pi";
interface BreadcrumbProps {
    rocrate: any;
    rocrateID: string;
    reponame: string;
    onSelect: (id: string) => void;
}

const findPath = (rocrate: any, targetID: string, currentPath: string[] = ["./"]): string[] | null => {
    const currentID = currentPath[currentPath.length - 1];
    if (currentID === targetID) {
        return currentPath;
    }

    const currentItem = rocrate["@graph"].find((item: any) => item["@id"] === currentID);
    if (!currentItem || !currentItem.hasPart) {
        return null;
    }

    for (const part of currentItem.hasPart) {
        const newPath = [...currentPath, part["@id"]];
        const result = findPath(rocrate, targetID, newPath);
        if (result) {
            return result;
        }
    }

    return null;
};

const findID = (rocrate: any, targetID: string): any | null => {
    return rocrate["@graph"].find((item: any) => item["@id"] === targetID) || null;
};

export const getFullPath = (rocrate: any, targetID: string): string | null => {
    const path = findPath(rocrate, targetID);
    if (!path) return null;
    return path.map((part, index) => (index < path.length - 1 && !part.endsWith("/") ? part + "/" : part)).join("");
};

const HasPartCount = ({ rocrate, rocrateID }: { rocrate: any; rocrateID: string }) => {
    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);

    if (!item || !item.hasPart) {
        return null;
    }

    return (
        <span className="ml-2 text-xs font-medium text-gray-600">
            ({item.hasPart.length} items)
        </span>
    );
};

export default function Breadcrumb({ rocrate, rocrateID, reponame, onSelect }: BreadcrumbProps) {
    const path = findPath(rocrate, rocrateID) || [];
    const [dropdownState, setDropdownState] = useState<{ [key: string]: boolean }>({});

    const toggleDropdown = (id: string) => {
        setDropdownState((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const getSortedParts = (parts: any[]) => {
        return parts.sort((a, b) => {
            const aIsFolder = a["@id"].endsWith("/");
            const bIsFolder = b["@id"].endsWith("/");
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a["@id"].localeCompare(b["@id"]);
        });
    };

    const contextualEntity = findID(rocrate, rocrateID);

    return (
        <>
            <nav aria-label="Breadcrumb" className="flex">
                <ol className="flex overflow-hidden rounded-lg border border-gray-200 text-gray-600">
                    <li className="flex items-center">
                        <a
                            href="#"
                            className="flex h-10 items-center gap-1.5 bg-gray-100 px-4 transition hover:text-gray-900"
                            onClick={() => onSelect("")}
                        >
                            <FaHome className="size-4" />
                            <span className="ms-1.5 text-xs font-medium"> {reponame} </span>
                        </a>
                    </li>
                    {path.length > 0 ? (
                        path.map((part, index) => {
                            const partSegments = part.split("/");
                            let lastSegment = partSegments[partSegments.length - 1];
                            if (lastSegment.length === 0 && partSegments.length > 1) {
                                lastSegment = partSegments[partSegments.length - 2];
                            }
                            const isLast = index === path.length - 1;
                            return (
                                <li key={index} className="relative flex items-center">
                                    <span
                                        className="absolute inset-y-0 -start-px h-10 w-4 bg-gray-100 [clip-path:_polygon(0_0,_0%_100%,_100%_50%)] rtl:rotate-180"
                                        onClick={() => onSelect(part)}
                                    ></span>
                                    <a
                                        href={`#${part}`}
                                        className={`flex h-10 items-center ${isLast ? 'bg-[#4CAF9C] text-white font-bold' : 'bg-gray-100'} pe-4 ps-8 text-xs font-medium transition hover:text-gray-900`}
                                        onClick={() => onSelect(part)}
                                    >
                                        {lastSegment.includes(".") ? <FaFile className={`size-4 ${isLast ? 'text-white' : ''}`} /> : <FaFolder className={`size-4 ${isLast ? 'text-white' : ''}`} />}
                                        <span className={`ms-1.5 ${isLast ? 'font-bold' : ''}`}>{lastSegment}</span>
                                    </a>
                                </li>
                            );
                        })
                    ) : contextualEntity ? (
                        <li className="relative flex items-center">
                            <span
                                className="absolute inset-y-0 -start-px h-10 w-4 bg-gray-100 [clip-path:_polygon(0_0,_0%_100%,_100%_50%)] rtl:rotate-180"
                                onClick={() => onSelect(rocrateID)}
                            ></span>
                            <a
                                href={`#${rocrateID}`}
                                className="flex h-10 items-center bg-[#4CAF9C] text-white font-bold pe-4 ps-8 text-xs font-medium transition hover:text-gray-900"
                                onClick={() => onSelect(rocrateID)}
                            >
                                <PiGraphFill className="size-4 text-white" />
                                <span className="ms-1.5 font-bold">{rocrateID}</span>
                            </a>
                        </li>
                    ) : null}
                </ol>
            </nav>
        </>
    );
}
