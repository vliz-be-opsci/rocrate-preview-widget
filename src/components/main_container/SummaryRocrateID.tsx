import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { getFullPath } from "./Breadcrumb";
import { hasType } from "../../utils/rocrateUtils";


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
        const fetchReadmeContent = async (url: string, rocrateidsearch: boolean, rocrateID?: string) => {
            try {
            let response;
            if (rocrateidsearch && rocrateID) {
                response = await fetch(rocrateID);
            } else {
                response = await fetch(url);
            }
            if (!response.ok) {
                if (rocrateidsearch) {
                    throw new Error("Failed to fetch README content. Please check if the path is correct in the RO-Crate metadata.");
                    return;
                }
                fetchReadmeContent(url, true, rocrateID);
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

        if (item && hasType(item, "Dataset") && item.hasPart) {
            const readmeItem = item.hasPart.find((part: any) => part["@id"].toLowerCase().includes("readme"));
            if (readmeItem) {
                setLoading(true);
                const fullPath = getFullPath(rocrate, readmeItem["@id"]);
                if (fullPath) {
                    fetchReadmeContent(fullPath, false, readmeItem["@id"]);
                } else {
                    fetchReadmeContent(readmeItem["@id"], true);
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
