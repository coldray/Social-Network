"use client";

import { useCallback } from "react";
import { useGraphStore } from "@/store/graph-store";

export function useShortestPath() {
  const {
    distanceUser1,
    distanceUser2,
    pathNodes,
    pathEdges,
    distance,
    nodes,
    selectDistanceUser,
    clearDistanceSelection,
    calculatePath,
    clearPath,
  } = useGraphStore();

  const getUser1Name = useCallback(() => {
    if (!distanceUser1) return null;
    const node = nodes.get(distanceUser1);
    return node?.login || distanceUser1;
  }, [distanceUser1, nodes]);

  const getUser2Name = useCallback(() => {
    if (!distanceUser2) return null;
    const node = nodes.get(distanceUser2);
    return node?.login || distanceUser2;
  }, [distanceUser2, nodes]);

  const isNodeInPath = useCallback(
    (nodeId: string) => pathNodes.has(nodeId),
    [pathNodes]
  );

  const isEdgeInPath = useCallback(
    (edgeId: string) => pathEdges.has(edgeId),
    [pathEdges]
  );

  const isDistanceUser = useCallback(
    (nodeId: string) => nodeId === distanceUser1 || nodeId === distanceUser2,
    [distanceUser1, distanceUser2]
  );

  return {
    distanceUser1,
    distanceUser2,
    pathNodes,
    pathEdges,
    distance,
    getUser1Name,
    getUser2Name,
    selectDistanceUser,
    clearDistanceSelection,
    calculatePath,
    clearPath,
    isNodeInPath,
    isEdgeInPath,
    isDistanceUser,
  };
}
