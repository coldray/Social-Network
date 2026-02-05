"use client";

import { useMemo, useRef } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
} from "d3-force";
import { GraphNode, GraphEdge } from "@/types/graph";

interface LayoutNode extends SimulationNodeDatum {
  id: string;
}

export function useForceLayout(
  nodes: Map<string, GraphNode>,
  edges: Map<string, GraphEdge>
): Map<string, { x: number; y: number }> {
  const positionCache = useRef<Map<string, { x: number; y: number }>>(new Map());
  const prevNodeCount = useRef(0);

  return useMemo(() => {
    const nodeCount = nodes.size;
    if (nodeCount === 0) {
      positionCache.current = new Map();
      prevNodeCount.current = 0;
      return new Map();
    }

    // Only recompute layout when node count changes
    if (nodeCount === prevNodeCount.current) {
      return positionCache.current;
    }

    prevNodeCount.current = nodeCount;

    // Build simulation nodes, preserving cached positions
    const simNodes: LayoutNode[] = Array.from(nodes.values()).map((node) => {
      const cached = positionCache.current.get(node.id);
      // If the node has a fixed position (fx/fy), use that
      if (node.fx != null && node.fy != null) {
        return {
          id: node.id,
          x: node.fx,
          y: node.fy,
          fx: node.fx,
          fy: node.fy,
        };
      }
      // If we have a cached position, pin it to keep existing nodes stable
      if (cached) {
        return {
          id: node.id,
          x: cached.x,
          y: cached.y,
          fx: cached.x,
          fy: cached.y,
        };
      }
      // New node: use its initial position from the store (radial placement)
      return {
        id: node.id,
        x: node.x ?? 0,
        y: node.y ?? 0,
      };
    });

    // Build links
    const nodeIdSet = new Set(nodes.keys());
    const simLinks = Array.from(edges.values())
      .filter((e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }));

    // Run simulation synchronously
    const simulation = forceSimulation<LayoutNode>(simNodes)
      .force(
        "link",
        forceLink<LayoutNode, { source: string; target: string }>(simLinks)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", forceManyBody().strength(-300))
      .force("center", forceCenter(0, 0).strength(0.05))
      .force("collision", forceCollide(30))
      .stop();

    // Tick synchronously
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    // Collect final positions
    const result = new Map<string, { x: number; y: number }>();
    for (const simNode of simNodes) {
      const x = simNode.x ?? 0;
      const y = simNode.y ?? 0;
      result.set(simNode.id, { x, y });
    }

    positionCache.current = result;
    return result;
  }, [nodes, edges]);
}
