import React, { useState } from "react";
import { FaFolder, FaFile, FaHome, FaCaretDown, FaCaretRight } from "react-icons/fa";

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

const HasPartDropdown = ({ rocrate, rocrateID, onSelect }: { rocrate: any; rocrateID: string; onSelect: (id: string) => void }) => {
    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);
    const [isOpen, setIsOpen] = useState(false);

    if (!item || !item.hasPart) {
        return null;
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="ml-2">
                {isOpen ? <FaCaretDown /> : <FaCaretRight />}
            </button>
            {isOpen && (
                <ul className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                    {item.hasPart.map((part: any, index: number) => (
                        <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => onSelect(part["@id"])}>
                            {part["@id"]}
                        </li>
                    ))}
                </ul>
            )}
        </div>
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
                    {path.map((part, index) => {
                        const partSegments = part.split("/");
                        const lastSegment = partSegments[partSegments.length - 1];
                        const isLast = index === path.length - 1;
                        const isOpen = dropdownState[part] || false;
                        return (
                            <li key={index} className="relative flex items-center">
                                <span
                                    className="absolute inset-y-0 -start-px h-10 w-4 bg-gray-100 [clip-path:_polygon(0_0,_0%_100%,_100%_50%)] rtl:rotate-180"
                                    onClick={() => onSelect(part)}
                                ></span>
                                <a
                                    href="#"
                                    className={`flex h-10 items-center ${isLast ? 'bg-[#4CAF9C] text-white font-bold' : 'bg-gray-100'} pe-4 ps-8 text-xs font-medium transition hover:text-gray-900`}
                                    onClick={() => {
                                        if (!lastSegment.includes(".")) {
                                            toggleDropdown(part);
                                            onSelect(part);
                                        } else {
                                            onSelect(part);
                                        }
                                    }}
                                >
                                    {lastSegment.includes(".") ? <FaFile className={`size-4 ${isLast ? 'text-white' : ''}`} /> : <FaFolder className={`size-4 ${isLast ? 'text-white' : ''}`} />}
                                    <span className={`ms-1.5 ${isLast ? 'font-bold' : ''}`}>{part}</span>
                                    {isLast && <HasPartCount rocrate={rocrate} rocrateID={part} />}
                                    {isLast && !lastSegment.includes(".") && (
                                        isOpen ? <FaCaretDown className="ml-2" /> : <FaCaretRight className="ml-2" />
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ol>
            </nav>
            {path.map((part, index) => {
                const isLast = index === path.length - 1;
                const isOpen = dropdownState[part] || false;
                return (
                    isLast && isOpen && (
                        <ul key={index} className="mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                            {getSortedParts(rocrate["@graph"].find((item: any) => item["@id"] === part)?.hasPart).map((subPart: any, subIndex: number) => (
                                <li key={subIndex} className="p-2 hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => onSelect(subPart["@id"])}>{subPart["@id"].endsWith("/") ? <FaFolder className="mr-2" /> : <FaFile className="mr-2" />}{subPart["@id"]}</li>
                            ))}
                        </ul>
                    )
                );
            })}
        </>
    );
}
