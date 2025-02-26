import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-forceatlas2/worker";

interface GraphVisProps {
  triples: any[];
  selectedSubject: string;
  relatedSubjects: Set<string>;
  onNodeClick: (nodeId: string) => void;
}

const GraphVis: React.FC<GraphVisProps> = ({
  triples,
  selectedSubject,
  relatedSubjects,
  onNodeClick,
}) => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<any>(null);
  const lastNodeClickedRef = useRef<string | null>(null);

  // Helper function to shorten labels
  const getShortLabel = (uri: string): string => {
    // For URIs, extract the last part after # or /
    if (uri.startsWith('http')) {
        const parts = uri.split(/[/#]/);
        return parts[parts.length - 1] || uri.substring(0, 20) + "...";
    }
    // For literal values, truncate if too long
    return uri.length > 20 ? uri.substring(0, 20) + "..." : uri;
  };

  useEffect(() => {
    if (!graphContainerRef.current) return;

    // Clear any existing graph
    if (graphInstanceRef.current) {
      graphInstanceRef.current.kill();
      graphInstanceRef.current = null;
    }
    
    // Get related triples for the selected subject
    const relatedTriples = triples.filter(triple => 
      relatedSubjects.has(triple.subject) || 
      (triple.object.startsWith('http') && relatedSubjects.has(triple.object))
    );
    
    if (relatedTriples.length === 0) return;
    
    // Create a new graph
    const graph = new Graph();
    
    // Count occurrences of each URI as a subject to determine node size
    const subjectCount: Record<string, number> = {};
    
    triples.forEach(triple => {
      if (subjectCount[triple.subject]) {
        subjectCount[triple.subject]++;
      } else {
        subjectCount[triple.subject] = 1;
      }
    });
    
    // Add nodes and edges
    const nodeMap = new Map();
    
    // Add all subjects and objects as nodes with random positions
    relatedTriples.forEach(triple => {
      if (!nodeMap.has(triple.subject)) {
        const count = subjectCount[triple.subject] || 1;
        // Calculate node size based on the number of triples for this subject
        // The size scales between 5 and 15 depending on the number of triples
        const size = Math.min(5 + Math.log(count) * 2, 15);
        
        nodeMap.set(triple.subject, {
          id: triple.subject,
          label: getShortLabel(triple.subject),
          size,
          x: Math.random(),  // Random x position
          y: Math.random(),  // Random y position
          color: triple.subject === selectedSubject ? "#FF5733" : "#6c757d"
        });
      }
      
      if (triple.object.startsWith('http') && !nodeMap.has(triple.object)) {
        const count = subjectCount[triple.object] || 1;
        const size = Math.min(5 + Math.log(count) * 2, 15);
        
        nodeMap.set(triple.object, {
          id: triple.object,
          label: getShortLabel(triple.object),
          size,
          x: Math.random(),  // Random x position
          y: Math.random(),  // Random y position
          color: triple.object === selectedSubject ? "#FF5733" : "#9c27b0"
        });
      }
    });
    
    // Add nodes to graph
    nodeMap.forEach((nodeData, nodeId) => {
      graph.addNode(nodeId, nodeData);
    });
    
    // Add edges between nodes
    relatedTriples.forEach((triple, index) => {
      if (triple.object.startsWith('http') && graph.hasNode(triple.object)) {
        try {
          graph.addEdge(triple.subject, triple.object, {
            id: `e${index}`,
            label: getShortLabel(triple.predicate),
            size: 1,
            color: "#ccc"
          });
        } catch (error) {
          console.error("Error adding edge:", error);
        }
      }
    });
    
    try {
      // Create sigma instance
      const container = graphContainerRef.current;
      container.innerHTML = "";
      
      // Custom edge rendering to show predicate labels
      const settings = {
        minCameraRatio: 0.1,
        maxCameraRatio: 10,
        renderLabels: true,
        labelFont: "Arial",
        labelSize: 12,
        labelWeight: "normal",
        renderEdgeLabels: true,
        edgeLabelSize: 10,
        edgeLabelFont: "Arial",
        // Custom edge label renderer
        edgeLabelRenderer: (context: any, { edge, color, label, size }: any, settings: any) => {
          const edgeData = graph.getEdgeAttributes(edge);
          
          if (!edgeData || !edgeData.label) return;
          
          // Get source & target coordinates
          const sourceData = graph.getNodeAttributes(graph.source(edge));
          const targetData = graph.getNodeAttributes(graph.target(edge));
          
          if (!sourceData || !targetData) return;
          
          const sourceX = sourceData.x;
          const sourceY = sourceData.y;
          const targetX = targetData.x;
          const targetY = targetData.y;
          
          // Compute label position
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;
          
          // Draw edge label background
          context.fillStyle = "rgba(255, 255, 255, 0.8)";
          context.font = `${settings.edgeLabelSize}px ${settings.edgeLabelFont}`;
          
          const textWidth = context.measureText(edgeData.label).width;
          const backgroundHeight = settings.edgeLabelSize + 2;
          const backgroundWidth = textWidth + 6;
          
          context.fillRect(
            midX - backgroundWidth / 2, 
            midY - backgroundHeight / 2,
            backgroundWidth,
            backgroundHeight
          );
          
          // Draw edge label text
          context.fillStyle = "#333";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(edgeData.label, midX, midY);
        }
      };
      
      const renderer = new Sigma(graph, container, settings);
      
      // Start force layout
      const layout = new ForceSupervisor(graph, {
        settings: {
          gravity: 1,
          adjustSizes: true,
          linLogMode: true,
          outboundAttractionDistribution: true,
          barnesHutOptimize: true,
          slowDown: 10
        }
      });
      
      layout.start();
      setTimeout(() => layout.stop(), 3000); // Run layout for 3 seconds
      
      // Add node click event with toggle functionality
      renderer.on("clickNode", ({ node }) => {
        const nodeId = node as string;
        
        // Track the clicked node
        const previousNode = lastNodeClickedRef.current;
        lastNodeClickedRef.current = nodeId;
        
        // Notify parent component about the clicked node
        onNodeClick(nodeId);
      });
      
      graphInstanceRef.current = {
        graph,
        renderer,
        layout,
        kill: () => {
          layout.stop();
          renderer.kill();
        }
      };
    } catch (error) {
      console.error("Error initializing sigma:", error);
    }

    // Cleanup function
    return () => {
      if (graphInstanceRef.current) {
        graphInstanceRef.current.kill();
      }
    };
  }, [triples, selectedSubject, relatedSubjects, onNodeClick]);

  return (
    <div className="mt-6">
      <h5 className="text-lg font-semibold mb-2">Graph Visualization</h5>
      <div 
        ref={graphContainerRef} 
        className="border border-gray-300 rounded-md"
        style={{ height: "400px", width: "100%" }}
      ></div>
      <p className="text-sm text-gray-500 mt-2">
        Click on nodes to explore relationships. Red node is the currently selected subject.
        Node size reflects the number of triples where the URI is the subject.
        Click on a selected node to deselect it.
      </p>
    </div>
  );
};

export default GraphVis;
