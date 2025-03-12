import React from "react";

interface TripleTableProps {
    triples: any[];
    onSubjectClick: (subject: string) => void;
    onObjectClick: (object: string) => void;
}

const TripleTable = ({ triples, onSubjectClick, onObjectClick }: TripleTableProps) => {
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#4CAF9C]">
                <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Predicate</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Object</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {triples.map((triple, index) => (
                    <tr key={index}>
                        <td 
                            className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                            style={{ maxWidth: "300px", cursor: "pointer" }}
                            title={triple.subject}
                            onClick={() => onSubjectClick(triple.subject)}
                        >
                            <div className="truncate" style={{ maxWidth: "300px" }}>{triple.subject}</div>
                        </td>
                        <td 
                            className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                            style={{ maxWidth: "300px" }}
                            title={triple.predicate}
                        >
                            <div className="truncate" style={{ maxWidth: "300px" }}>{triple.predicate}</div>
                        </td>
                        <td 
                            className="px-6 py-1 whitespace-nowrap text-sm text-gray-500" 
                            style={{ maxWidth: "300px", cursor: triple.object.startsWith('http') ? "pointer" : "default" }}
                            title={triple.object}
                            onClick={() => triple.object.startsWith('http') && onObjectClick(triple.object)}
                        >
                            <div className="truncate" style={{ maxWidth: "300px" }}>{triple.object}</div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TripleTable;
