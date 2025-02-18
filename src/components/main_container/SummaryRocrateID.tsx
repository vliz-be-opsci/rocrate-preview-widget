import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getFullPath } from "./Breadcrumb";

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
        const fetchReadmeContent = async (url: string) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch README content");
                const text = await response.text();
                setReadmeContent(text);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (item && item["@type"] === "Dataset" && item.hasPart) {
            const readmeItem = item.hasPart.find((part: any) => part["@id"].toLowerCase().includes("readme"));
            if (readmeItem) {
                setLoading(true);
                const fullPath = getFullPath(rocrate, readmeItem["@id"]);
                if (fullPath) {
                    fetchReadmeContent(fullPath);
                } else {
                    fetchReadmeContent(readmeItem["@id"]);
                }
            }
        }
    }, [rocrateID, item]);

    if (!item) return null;

    if (item["@type"] === "File" && item.description) {
        return <p>{item.description}</p>;
    }

    if (item["@type"] === "Dataset" && readmeContent) {
        return (
            <div>
                {loading && <p>Loading README...</p>}
                {error && <p>Error: {error}</p>}
                {readmeContent && <ReactMarkdown>{readmeContent}</ReactMarkdown>}
            </div>
        );
    }

    if (item.description) {
        return <p>{item.description}</p>;
    }

    return null;
};

export default SummaryRocrateID;
