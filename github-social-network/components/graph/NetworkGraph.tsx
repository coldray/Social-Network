"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useGraphStore } from "@/store/graph-store";
import { useGraph } from "@/hooks/useGraph";
import { useShortestPath } from "@/hooks/useShortestPath";
import { Loader2 } from "lucide-react";

// Dynamic import to avoid SSR issues with react-force-graph-2d
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface ImageCache {
  [key: string]: HTMLImageElement;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraphNode = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraphLink = any;

export function NetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<ImageCache>({});
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { nodes, edges, mode, loading, setHoveredNode } = useGraphStore();
  const { expandNode, selectAndFetchUserInfo } = useGraph();
  const { selectDistanceUser, isNodeInPath, isEdgeInPath, isDistanceUser } = useShortestPath();

  // Convert Map to array for the graph
  const graphData = {
    nodes: Array.from(nodes.values()).map(node => ({
      ...node,
      fx: node.fx ?? undefined,
      fy: node.fy ?? undefined,
    })),
    links: Array.from(edges.values()).map((edge) => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    })),
  };

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Preload images
  useEffect(() => {
    nodes.forEach((node) => {
      if (!imageCache.current[node.id] && node.avatar_url) {
        const img = new Image();
        img.src = node.avatar_url;
        img.crossOrigin = "anonymous";
        imageCache.current[node.id] = img;
      }
    });
  }, [nodes]);

  const handleNodeClick = useCallback(
    (node: ForceGraphNode) => {
      if (!node?.id) return;
      switch (mode) {
        case "expand":
          expandNode(node.id);
          break;
        case "explore":
          selectAndFetchUserInfo(node.id);
          break;
        case "distance":
          selectDistanceUser(node.id);
          break;
      }
    },
    [mode, expandNode, selectAndFetchUserInfo, selectDistanceUser]
  );

  const handleNodeHover = useCallback(
    (node: ForceGraphNode | null) => {
      setHoveredNode(node?.id || null);
      if (containerRef.current) {
        containerRef.current.style.cursor = node ? "pointer" : "grab";
      }
    },
    [setHoveredNode]
  );

  const nodeCanvasObject = useCallback(
    (node: ForceGraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (!node?.id || !node?.login) return;

      const size = 20;
      const x = node.x || 0;
      const y = node.y || 0;

      // Determine node styling based on state
      let strokeColor = "#666";
      let strokeWidth = 1;

      if (mode === "distance") {
        if (isDistanceUser(node.id)) {
          strokeColor = "#f59e0b"; // amber for selected
          strokeWidth = 3;
        } else if (isNodeInPath(node.id)) {
          strokeColor = "#22c55e"; // green for path
          strokeWidth = 2;
        }
      }

      if (node.expanded) {
        strokeColor = "#3b82f6"; // blue for expanded
        strokeWidth = strokeWidth === 1 ? 2 : strokeWidth;
      }

      // Draw circle background
      ctx.beginPath();
      ctx.arc(x, y, size / 2 + strokeWidth, 0, 2 * Math.PI);
      ctx.fillStyle = strokeColor;
      ctx.fill();

      // Draw avatar
      const img = imageCache.current[node.id];
      if (img && img.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        ctx.restore();
      } else {
        // Fallback circle
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#e5e7eb";
        ctx.fill();

        // Draw initial
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#374151";
        ctx.fillText(node.login.charAt(0).toUpperCase(), x, y);
      }

      // Draw label below
      if (globalScale > 0.5) {
        ctx.font = `${10 / globalScale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#374151";
        ctx.fillText(node.login, x, y + size / 2 + 2);
      }
    },
    [mode, isDistanceUser, isNodeInPath]
  );

  const nodePointerAreaPaint = useCallback(
    (node: ForceGraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, 12, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    []
  );

  const linkColor = useCallback(
    (link: ForceGraphLink) => {
      if (mode === "distance" && link?.id && isEdgeInPath(link.id)) {
        return "#22c55e"; // green for path
      }
      return "#999";
    },
    [mode, isEdgeInPath]
  );

  const linkWidth = useCallback(
    (link: ForceGraphLink) => {
      if (mode === "distance" && link?.id && isEdgeInPath(link.id)) {
        return 3;
      }
      return 1;
    },
    [mode, isEdgeInPath]
  );

  return (
    <div ref={containerRef} className="w-full h-full bg-background">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {nodes.size === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Search for a GitHub user to start exploring</p>
        </div>
      ) : (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeId="id"
          nodeLabel="login"
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTicks={100}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      )}
    </div>
  );
}
