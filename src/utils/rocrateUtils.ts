
export const getLabelForItem = (item: any): string => {
    console.log(item);
    const labels = ["prefLabel", "name", "title", "altLabel"];
    for (const label of labels) {
        if (item[label]) return item[label];
    }

    return item["@id"];
};

export const getIDforItem = (item: any, rocrate_graph:any): any => {
   //search rocrate_graph which is an array of dicts and return the dict with the same id as item
   console.log(item);
   console.log(rocrate_graph);
    let item_dict = rocrate_graph.find((element:any) => element["@id"] === item);
    if (item_dict === undefined) {
        return item;
    }
    return item_dict;
}

