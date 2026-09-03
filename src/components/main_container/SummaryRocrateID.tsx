import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { getFullPath } from "./Breadcrumb";
import { hasType, getPartId } from "../../utils/rocrateUtils";


interface SummaryRocrateIDProps {
    rocrate: any;
    rocrateID: string;
}

const SummaryRocrateID = ({ rocrate, rocrateID }: SummaryRocrateIDProps) => {
    const [readmeContent, setReadmeContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const item = rocrate["@graph"].find((item: any) => item["@id"] === rocrateID);

    useEffect(() => {
        const fetchReadmeContent = async (url: string, rocrateidsearch: boolean, originalRocrateID?: string) => {
            try {
            const response = await fetch(url);
            if (!response.ok) {
                if (rocrateidsearch) {
                    throw new Error("Readme not found");
                }
                if (originalRocrateID) {
                    fetchReadmeContent(originalRocrateID, true);
                }
            } else {
                const text = await response.text();
                setReadmeContent(text);
                setLoading(false);
            }
            } catch (err: any) {
            setError(err.message);
            setLoading(false);
            }
        };

        if (item && hasType(item, "Dataset") && item.hasPart && Array.isArray(item.hasPart)) {
            const readmeItem = item.hasPart.find((part: any) => {
                const partId = getPartId(part);
                return partId && partId.toLowerCase().includes("readme");
            });
            if (readmeItem) {
                const readmeId = getPartId(readmeItem);
                setLoading(true);
                const fullPath = getFullPath(rocrate, readmeId);
                if (fullPath) {
                    fetchReadmeContent(fullPath, false, readmeId);
                } else {
                    fetchReadmeContent(readmeId, true);
                }
            }
        }
    }, [rocrateID, item]);

    if (!item) return null;

    if (hasType(item, "File") && item.description) {
        return <div className="my-1"><p>{item.description}</p></div>;
    }

    if (hasType(item, "Dataset")) {
        return (
            <div className="my-1">
                {loading && <p>Loading README...</p>}
                {error && (
                    <div className="error-card">
                        <p>Error: {error}</p>
                        <p>
                            Please report this issue at <strong>github/vliz-be-opsci</strong>:
                            <a href="https://github.com/vliz-be-opsci/rocrate-preview-widget/issues/new" target="_blank" rel="noopener noreferrer">
                                https://github.com/vliz-be-opsci/rocrate-preview-widget/issues/new
                            </a>
                        </p>
                    </div>
                )}
                {readmeContent && (
                    <ReactMarkdown className="modest" remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                        {readmeContent}
                    </ReactMarkdown>
                )}
            </div>
        );
    }

    if (item.description) {
        return <div className="my-1"><p>{item.description}</p></div>;
    }

    return null;
};

export default SummaryRocrateID;
