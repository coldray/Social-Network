"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type OnNodeDrag,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGraphStore } from "@/store/graph-store";
import { useGitHubUser } from "@/hooks/useGitHubUser";
import { useShortestPath } from "@/hooks/useShortestPath";
import { useForceLayout } from "@/hooks/useForceLayout";
import { GitHubNode } from "./GitHubNode";
import { GitHubNodeData } from "@/types/graph";
import { Loader2 } from "lucide-react";

// Define nodeTypes OUTSIDE the component to avoid remounting
const nodeTypes = { github: GitHubNode };

type FlowNode = Node<GitHubNodeData, "github">;

function NetworkGraphInner() {
  const {
    nodes,
    edges,
    mode,
    loading,
    hoveredNode,
    setHoveredNode,
    setLoading,
    setError,
    addUserWithFollowers,
    setSelectedNode,
    updateNodeData,
    updateNodePosition,
  } = useGraphStore();

  const { fetchFollowers, fetchUser } = useGitHubUser();
  const { selectDistanceUser, isNodeInPath, isEdgeInPath, isDistanceUser } =
    useShortestPath();
  const { fitView } = useReactFlow();

  // Track root node
  const [rootNodeId, setRootNodeId] = useState<string | null>(null);
  const [isLayoutting, setIsLayoutting] = useState(false);
  const prevNodeCount = useRef(0);

  useEffect(() => {
    if (nodes.size > 0 && !rootNodeId) {
      setRootNodeId(Array.from(nodes.keys())[0]);
    }
    if (nodes.size === 0) {
      setRootNodeId(null);
    }
  }, [nodes.size, rootNodeId]);

  // Run force layout
  const positions = useForceLayout(nodes, edges);

  // Show "Arranging..." briefly when nodes change
  useEffect(() => {
    if (nodes.size !== prevNodeCount.current && nodes.size > 0) {
      setIsLayoutting(true);
      prevNodeCount.current = nodes.size;
      const timer = setTimeout(() => {
        setIsLayoutting(false);
        // Fit view after layout settles
        fitView({ padding: 0.2, duration: 300 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes.size, fitView]);

  // Convert store nodes → React Flow nodes
  const flowNodes: FlowNode[] = useMemo(() => {
    return Array.from(nodes.values()).map((node) => {
      const pos = positions.get(node.id);
      return {
        id: node.id,
        type: "github" as const,
        position: { x: pos?.x ?? node.x ?? 0, y: pos?.y ?? node.y ?? 0 },
        data: {
          login: node.login,
          avatar_url: node.avatar_url,
          isRoot: node.id === rootNodeId,
          expanded: node.expanded ?? false,
          isHovered: node.id === hoveredNode,
          isDistanceUser: isDistanceUser(node.id),
          isInPath: isNodeInPath(node.id),
          mode,
        },
      };
    });
  }, [nodes, positions, rootNodeId, hoveredNode, mode, isDistanceUser, isNodeInPath]);

  // Convert store edges → React Flow edges
  const flowEdges: Edge[] = useMemo(() => {
    return Array.from(edges.values()).map((edge) => {
      const inPath = mode === "distance" && isEdgeInPath(edge.id);
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        style: {
          stroke: inPath ? "#22c55e" : "rgba(148, 163, 184, 0.4)",
          strokeWidth: inPath ? 3 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: inPath ? "#22c55e" : "rgba(148, 163, 184, 0.4)",
        },
      };
    });
  }, [edges, mode, isEdgeInPath]);

  // Node click handler
  const handleNodeClick: NodeMouseHandler<FlowNode> = useCallback(
    async (_event, node) => {
      if (!node?.id) return;

      if (mode === "expand") {
        const currentNodes = useGraphStore.getState().nodes;
        const currentNode = currentNodes.get(node.id);
        if (!currentNode || currentNode.expanded) return;

        setLoading(true);
        setError(null);

        try {
          const followers = await fetchFollowers(node.id, 1, 10);
          addUserWithFollowers(
            { login: currentNode.login, avatar_url: currentNode.avatar_url },
            followers
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to expand");
        } finally {
          setLoading(false);
        }
      } else if (mode === "explore") {
        setSelectedNode(node.id);
        const currentNodes = useGraphStore.getState().nodes;
        const currentNode = currentNodes.get(node.id);
        if (currentNode && !currentNode.userData) {
          try {
            const user = await fetchUser(node.id);
            if (user) updateNodeData(node.id, user);
          } catch {
            // ignore
          }
        }
      } else if (mode === "distance") {
        selectDistanceUser(node.id);
      }
    },
    [
      mode,
      fetchFollowers,
      fetchUser,
      addUserWithFollowers,
      setLoading,
      setError,
      setSelectedNode,
      updateNodeData,
      selectDistanceUser,
    ]
  );

  // Hover handlers
  const handleNodeMouseEnter: NodeMouseHandler<FlowNode> = useCallback(
    (_event, node) => {
      setHoveredNode(node.id);
    },
    [setHoveredNode]
  );

  const handleNodeMouseLeave: NodeMouseHandler<FlowNode> = useCallback(
    () => {
      setHoveredNode(null);
    },
    [setHoveredNode]
  );

  // Drag end handler — write position back to store
  const handleNodeDragStop: OnNodeDrag<FlowNode> = useCallback(
    (_event, node) => {
      updateNodePosition(node.id, node.position.x, node.position.y);
    },
    [updateNodePosition]
  );

  return (
    <div className="w-full h-full bg-background relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {nodes.size === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Search for a GitHub user to start exploring</p>
        </div>
      ) : (
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onNodeDragStop={handleNodeDragStop}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={4}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable={false}
          selectNodesOnDrag={false}
        />
      )}

      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border rounded-md px-3 py-2 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLayoutting
                ? "bg-yellow-500 animate-pulse"
                : "bg-green-500"
            }`}
          ></span>
          <span className="font-medium">
            {isLayoutting ? "Arranging..." : "Ready"}
          </span>
        </div>
        <div className="text-muted-foreground mt-1 capitalize">
          {mode} mode
        </div>
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur border rounded-md px-3 py-2 text-xs text-muted-foreground shadow-sm">
        <div>
          Click node to{" "}
          {mode === "expand"
            ? "expand"
            : mode === "explore"
            ? "view info"
            : "select"}
        </div>
        <div>Drag node to move</div>
      </div>
    </div>
  );
}

export function NetworkGraph() {
  return (
    <ReactFlowProvider>
      <NetworkGraphInner />
    </ReactFlowProvider>
  );
}
