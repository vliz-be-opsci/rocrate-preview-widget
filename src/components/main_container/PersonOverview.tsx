import React from "react";
import { componentTypes, getContextLink } from "../../utils/rocrateUtils";
interface PersonOverviewProps {
    rocrate?: any; // Accept rocrate as a new prop
}

const PersonOverview: React.FC<PersonOverviewProps> = ({ rocrate }) => {
    let person_type_uris = componentTypes["person_entity"].URIs;
    console.log("PersonOverview rocrate", rocrate);

    let persons = [];
    const graph = rocrate['@graph'] || [];
    for (const entity of graph) {
        const entityTypes = Array.isArray(entity["@type"]) ? entity["@type"] : [entity["@type"]];
        const resolvedEntityTypes = entityTypes.map((type) => getContextLink(rocrate, type));
        if (resolvedEntityTypes.some((type) => person_type_uris.includes(type))) {
            persons.push(entity);
        }
    }

    return (
        <div>
            {persons.map((person, index) => (
                <div key={index}>
                    <h3>{person.name || person.id}</h3>
                    <p>{person.description}</p>
                </div>
            ))}
        </div>
    );
};

export default PersonOverview;