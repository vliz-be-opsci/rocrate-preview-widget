import React, { useState } from "react";
import Graph from "react-graph-vis";

export default function GraphComponent(props: any) {

    const rocrate = props.rocrate;

    //maka a function that will extract the data from the rocrate file to make the nodes
    function makeNodes(rocrate: any) {
        let nodes = [];
        let edges = [];

        let counter = 1;
        let cid_counter = 1;

        //loop over the @graph array and check if the @id is "./" or "ro-crate-metadata.json"
        for (let i in rocrate["@graph"]) {
            let item = rocrate["@graph"][i];
            console.log(item);

            //make node 
            //if the key is @id then the value is the id of the node else the value is the label of the node
            let node = {};
            const counter_current_id = counter
            node["id"] = counter_current_id;
            counter = counter + 1;
            node["label"] = item["@id"];
            node["title"] = item["@id"];

            //make node color based on item["@type"]
            // dataset => red
            // file => green
            //other => blue
            if (item["@type"] == "Dataset") {
                node["color"] = "red";
            }
            if (item["@type"] == "File") {
                node["color"] = "green";
            }
            if (item["@type"] != "Dataset" && item["@type"] != "File") {
                node["color"] = "blue";
            }
            nodes.push(node);
            i = i + 1;
        }

        for (let i in rocrate["@graph"]) {
            let item = rocrate["@graph"][i];
            let current_cid_counter = cid_counter;
            let test_cid_counter = cid_counter;
            console.log(item);
            //make const that will show the from node
            const from_node = item["@id"];
            //find the id of the from node
            let from_node_id = 0;
            for (let i in nodes) {
                if (nodes[i]["title"] == from_node) {
                    from_node_id = nodes[i]["id"];
                }
            }
            console.log(from_node_id);

            //loop over the keys of the item
            for (let key in item) {
                if (key != "@id" && key != "@type") {
                    console.log(key,item[key]);
                    //first do the case where the value is a string
                    if (typeof item[key] == "string") {
                        //make node for the value
                        let node = {};
                        const counter_current_id = counter
                        node["id"] = counter_current_id;
                        counter = counter + 1;
                        node["label"] = item[key];
                        node["title"] = item[key];
                        //add cid to the node
                        node["cid"] = cid_counter;
                        test_cid_counter = cid_counter + 1;
                        nodes.push(node);
                        //make edge between the from node and the value node
                        let edge = {};
                        edge["from"] = from_node_id;
                        edge["to"] = counter_current_id;
                        edge["label"] = key;
                        edges.push(edge);
                    }
                    //then do the case where the value is a list
                    if (typeof item[key] == "object" && Array.isArray(item[key])) {
                        console.log(key,item[key]);
                        //loop over the list
                        for (let i in item[key]) {
                            console.log(key,item[key][i]);
                            //check if the value is a string or an object
                            if (typeof item[key][i] == "string") {
                                console.log(key,item[key][i]);
                                //check if the node already exists
                                let counter_current_id = 0;
                                let node_exists = false;
                                for (let i in nodes) {
                                    if (nodes[i]["title"] == item[key][i]) {
                                        node_exists = true;
                                        counter_current_id = nodes[i]["id"];
                                        nodes[i]["cid"] = cid_counter;
                                        test_cid_counter = cid_counter + 1;
                                    }
                                }
                                //if the node does not exist make it
                                if (node_exists == false) {
                                    //make node for the value
                                    let node = {};
                                    counter_current_id = counter
                                    node["id"] = counter_current_id;
                                    counter = counter + 1;
                                    node["label"] = item[key][i];
                                    node["title"] = item[key][i];
                                    //add cid to the node
                                    node["cid"] = cid_counter;
                                    test_cid_counter = cid_counter + 1;
                                    nodes.push(node);
                                }
                                //make edge between the from node and the value node
                                let edge = {};
                                edge["from"] = from_node_id;
                                edge["to"] = counter_current_id;
                                edge["label"] = key;
                                edges.push(edge);
                            }
                            //check if type is object
                            if (typeof item[key][i] == "object") {
                                console.log(key,item[key][i]);
                                //get the @id of the object
                                const node_label = item[key][i]["@id"];
                                //chek if the node already exists
                                let counter_current_id = 0;
                                let node_exists = false;
                                for (let i in nodes) {
                                    if (nodes[i]["title"] == node_label) {
                                        node_exists = true;
                                        counter_current_id = nodes[i]["id"];
                                        nodes[i]["cid"] = cid_counter;
                                        test_cid_counter = cid_counter + 1;
                                    }
                                }
                                //if the node does not exist make it
                                if (node_exists == false) {
                                    //make node for the value
                                    let node = {};
                                    counter_current_id = counter
                                    node["id"] = counter_current_id;
                                    counter = counter + 1;
                                    node["label"] = node_label;
                                    node["title"] = node_label;
                                    //add cid to the node
                                    node["cid"] = cid_counter;
                                    test_cid_counter = cid_counter + 1;
                                    nodes.push(node);
                                }
                                //make edge between the from node and the value node
                                let edge = {};
                                edge["from"] = from_node_id;
                                edge["to"] = counter_current_id;
                                edge["label"] = key;
                                edges.push(edge);
                            }
                        }
                    }
                    if (typeof item[key] == "object" && Array.isArray(item[key])==false) {
                        console.log(key,item[key]);
                        //get the @id of the object
                        const node_label = item[key]["@id"];
                        //chek if the node already exists
                        let counter_current_id = 0;
                        let node_exists = false;
                        for (let i in nodes) {
                            if (nodes[i]["title"] == node_label) {
                                node_exists = true;
                                counter_current_id = nodes[i]["id"];
                                nodes[i]["cid"] = cid_counter;
                                test_cid_counter = cid_counter + 1;
                            }
                        }
                        //if the node does not exist make it
                        if (node_exists == false) {
                            //make node for the value
                            let node = {};
                            counter_current_id = counter
                            node["id"] = counter_current_id;
                            counter = counter + 1;
                            node["label"] = node_label;
                            node["title"] = node_label;
                            //add cid to the node
                            node["cid"] = cid_counter;
                            test_cid_counter = cid_counter + 1;
                            nodes.push(node);
                        }
                        //make edge between the from node and the value node
                        let edge = {};
                        edge["from"] = from_node_id;
                        edge["to"] = counter_current_id;
                        edge["label"] = key;
                        edges.push(edge);
                    }
                }
            }

            if (current_cid_counter != test_cid_counter) {
                cid_counter = cid_counter + 1;
            }

            i = i + 1;
        }

        let graph = {nodes: nodes, edges: edges};
        return graph;
    }

    let graphe = makeNodes(rocrate);
    console.log(graphe);
    
      const options = {
        joinCondition: function(nodeOptions) {
            return nodeOptions.cid == 2;
        },
        layout: {
            improvedLayout:true,
            clusterThreshold: 150,
            hierarchical: {
                enabled: true,
                levelSeparation: 200,
                nodeSpacing: 250,
                treeSpacing: 2000,
                blockShifting: true,
                edgeMinimization: true,
                parentCentralization: true,
                direction: "UD",        // UD, DU, LR, RL
            }
        },
        edges: {
          color: "#000000"
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 95,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.5
            },
            repulsion: {
                centralGravity: 0.2,
                springLength: 200,
                springConstant: 0.05,
                nodeDistance: 250,
                damping: 0.09
              },
              hierarchicalRepulsion: {
                centralGravity: 0.0,
                springLength: 100,
                springConstant: 0.01,
                nodeDistance: 250,
                damping: 0.09,
                avoidOverlap: 0
              },
        },
        height: "400px"
      };
    
      const events = {
        select: function(event) {
          var { nodes, edges } = event;
          if (nodes.length > 0) {
            const clickedNode = nodes[0];
            //alert(clickedNode);
          }
        },
        doubleClick: function(event) {
            var { nodes, edges } = event;
            if (nodes.length > 0) {
                const clickedNode = nodes[0];
                //get label of the node
                let label = "";
                for (let i in graphe["nodes"]) {
                    if (graphe["nodes"][i]["id"] == clickedNode) {
                        label = graphe["nodes"][i]["label"];
                    }
                }
                console.log(label);
            }
            }
      };

    // use a state variable to store the network instance
  const [networkInstance, setNetworkInstance] = useState(null);

  // update the state variable within the getNetwork function
  const getNetwork = (network) => {
    setNetworkInstance(network);
  };

  // use the state variable to call clusterByHubsize
  const clusterByHubsize = () => {
    if (networkInstance) {
      networkInstance.clusterByHubsize();
    }
  };


      return (
        <>
        <Graph
          graph={graphe}
          options={options}
          events={events}
          getNetwork={getNetwork}
        />
        <button onClick={clusterByHubsize}>Cluster</button>
        </>
      );
}