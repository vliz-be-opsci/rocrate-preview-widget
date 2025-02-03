import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaJs, FaHtml5, FaCss3Alt, FaMarkdown, FaPython, FaJava, FaPhp, FaRust, FaFileCode,FaTerminal, FaCuttlefish, FaGem, FaYarn } from "react-icons/fa";

interface CodePreviewProps {
    fileContent: string;
    mimeType: string;
    fileName: string;
}

const CodePreview = ({ fileContent, mimeType, fileName }: CodePreviewProps) => {
    const getLanguage = (mimeType: string, fileName: string) => {
        const extension = fileName.split('.').pop();
        switch (extension) {
            case "js":
                return "javascript";
            case "html":
                return "html";
            case "css":
                return "css";
            case "md":
                return "markdown";
            case "xml":
                return "xml";
            case "py":
                return "python";
            case "sh":
                return "bash";
            case "c":
                return "c";
            case "cpp":
                return "cpp";
            case "java":
                return "java";
            case "rb":
                return "ruby";
            case "php":
                return "php";
            case "go":
                return "go";
            case "rs":
                return "rust";
            case "yaml":
            case "yml":
                return "yaml";
            case "toml":
                return "toml";
            case "json":
                return "json";
            default:
                return getLanguageFromMimeType(mimeType);
        }
    };

    const getLanguageFromMimeType = (mimeType: string) => {
        switch (mimeType) {
            case "text/javascript":
                return "javascript";
            case "text/html":
                return "html";
            case "text/css":
                return "css";
            case "text/markdown":
                return "markdown";
            case "text/xml":
                return "xml";
            case "text/x-python":
                return "python";
            case "text/x-sh":
                return "bash";
            case "text/x-csrc":
                return "c";
            case "text/x-c++src":
                return "cpp";
            case "text/x-java-source":
                return "java";
            case "text/x-ruby":
                return "ruby";
            case "text/x-php":
                return "php";
            case "text/x-go":
                return "go";
            case "text/x-rustsrc":
                return "rust";
            case "text/x-yaml":
                return "yaml";
            case "text/x-toml":
                return "toml";
            case "application/json":
                return "json";
            default:
                return "plaintext";
        }
    };

    const getLanguageIcon = (language: string) => {
        switch (language) {
            case "javascript":
                return <FaJs />;
            case "html":
                return <FaHtml5 />;
            case "css":
                return <FaCss3Alt />;
            case "markdown":
                return <FaMarkdown />;
            case "python":
                return <FaPython />;
            case "bash":
                return <FaTerminal />;
            case "cpp":
                return <FaCuttlefish />;
            case "java":
                return <FaJava />;
            case "ruby":
                return <FaGem />;
            case "php":
                return <FaPhp />;
            case "rust":
                return <FaRust />;
            case "yaml":
                return <FaYarn />;
            case "toml":
                return <FaYarn />;
            default:
                return <FaFileCode />;
        }
    };

    const language = getLanguage(mimeType, fileName);
    const fileSize = new Blob([fileContent]).size;

    return (
        <div>
            <div className="flex space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded flex items-center">
                    {getLanguageIcon(language)}
                    <span className="ml-1">{language}</span>
                </span>
            </div>
            <SyntaxHighlighter language={language} style={coy}>
                {fileContent}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodePreview;
