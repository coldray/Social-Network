import { GraphNode, GraphEdge } from "@/types/graph";

interface BFSResult {
  distance: number | null;
  path: string[];
}

/**
 * Find the shortest path between two nodes using BFS
 * Treats the graph as undirected (can traverse edges in both directions)
 */
export function findShortestPath(
  nodes: Map<string, GraphNode>,
  edges: Map<string, GraphEdge>,
  start: string,
  end: string
): BFSResult {
  // If start equals end
  if (start === end) {
    return { distance: 0, path: [start] };
  }

  // Check if both nodes exist
  if (!nodes.has(start) || !nodes.has(end)) {
    return { distance: null, path: [] };
  }

  // Build adjacency list (undirected)
  const adjacencyList = new Map<string, Set<string>>();

  // Initialize all nodes
  Array.from(nodes.keys()).forEach((nodeId) => {
    adjacencyList.set(nodeId, new Set());
  });

  // Add edges (both directions since we treat it as undirected)
  Array.from(edges.values()).forEach((edge) => {
    const sourceId = typeof edge.source === "string" ? edge.source : (edge.source as unknown as GraphNode).id;
    const targetId = typeof edge.target === "string" ? edge.target : (edge.target as unknown as GraphNode).id;

    adjacencyList.get(sourceId)?.add(targetId);
    adjacencyList.get(targetId)?.add(sourceId);
  });

  // BFS
  const queue: string[] = [start];
  const visited = new Set<string>([start]);
  const parent = new Map<string, string | null>([[start, null]]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === end) {
      // Reconstruct path
      const path: string[] = [];
      let node: string | null = end;
      while (node !== null) {
        path.unshift(node);
        node = parent.get(node) ?? null;
      }
      return { distance: path.length - 1, path };
    }

    const neighbors = adjacencyList.get(current) || new Set();
    Array.from(neighbors).forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    });
  }

  // No path found
  return { distance: null, path: [] };
}
