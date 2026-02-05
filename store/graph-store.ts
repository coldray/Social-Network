import { create } from "zustand";
import { GraphNode, GraphEdge, Mode } from "@/types/graph";
import { GitHubUser, GitHubFollower } from "@/types/github";
import { findShortestPath } from "@/lib/bfs";

interface GraphState {
  // Graph data
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;

  // UI state
  mode: Mode;
  selectedNode: string | null;
  hoveredNode: string | null;
  loading: boolean;
  error: string | null;

  // Distance mode state
  distanceUser1: string | null;
  distanceUser2: string | null;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
  pathList: string[]; // Ordered list of nodes in path
  distance: number | null;

  // Actions
  setMode: (mode: Mode) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Graph actions
  addNode: (node: GraphNode) => void;
  addEdge: (edge: GraphEdge) => void;
  updateNodeData: (nodeId: string, userData: GitHubUser) => void;
  markNodeExpanded: (nodeId: string) => void;

  // Add user and their followers with radial positioning
  addUserWithFollowers: (
    user: { login: string; avatar_url: string },
    followers: GitHubFollower[]
  ) => void;

  // Distance mode actions
  selectDistanceUser: (nodeId: string) => void;
  clearDistanceSelection: () => void;
  calculatePath: () => void;
  clearPath: () => void;

  // Position update (for drag write-back)
  updateNodePosition: (nodeId: string, x: number, y: number) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  nodes: new Map<string, GraphNode>(),
  edges: new Map<string, GraphEdge>(),
  mode: "expand" as Mode,
  selectedNode: null,
  hoveredNode: null,
  loading: false,
  error: null,
  distanceUser1: null,
  distanceUser2: null,
  pathNodes: new Set<string>(),
  pathEdges: new Set<string>(),
  pathList: [] as string[],
  distance: null,
};

export const useGraphStore = create<GraphState>((set, get) => ({
  ...initialState,

  setMode: (mode) => {
    set({ mode });
    // Clear distance selection when changing modes
    if (mode !== "distance") {
      get().clearDistanceSelection();
      get().clearPath();
    }
  },

  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addNode: (node) => {
    const { nodes } = get();
    if (!nodes.has(node.id)) {
      const newNodes = new Map(nodes);
      newNodes.set(node.id, node);
      set({ nodes: newNodes });
    }
  },

  addEdge: (edge) => {
    const { edges } = get();
    if (!edges.has(edge.id)) {
      const newEdges = new Map(edges);
      newEdges.set(edge.id, edge);
      set({ edges: newEdges });
    }
  },

  updateNodeData: (nodeId, userData) => {
    const { nodes } = get();
    const node = nodes.get(nodeId);
    if (node) {
      const newNodes = new Map(nodes);
      newNodes.set(nodeId, { ...node, userData });
      set({ nodes: newNodes });
    }
  },

  markNodeExpanded: (nodeId) => {
    const { nodes } = get();
    const node = nodes.get(nodeId);
    if (node) {
      const newNodes = new Map(nodes);
      newNodes.set(nodeId, { ...node, expanded: true });
      set({ nodes: newNodes });
    }
  },

  addUserWithFollowers: (user, followers) => {
    const { nodes, edges } = get();
    const newNodes = new Map(nodes);
    const newEdges = new Map(edges);

    // Get parent node position (or use center if first node)
    const parentNode = nodes.get(user.login);
    const parentX = parentNode?.x ?? 0;
    const parentY = parentNode?.y ?? 0;

    // Add the main user node if not exists
    if (!newNodes.has(user.login)) {
      newNodes.set(user.login, {
        id: user.login,
        login: user.login,
        avatar_url: user.avatar_url,
        x: parentX,
        y: parentY,
      });
    }

    // Add followers in a simple circle around parent
    // Force simulation will adjust positions
    const radius = 150;
    const angleStep = (2 * Math.PI) / Math.max(followers.length, 1);

    followers.forEach((follower, index) => {
      if (!newNodes.has(follower.login)) {
        const angle = angleStep * index - Math.PI / 2;
        const x = parentX + radius * Math.cos(angle);
        const y = parentY + radius * Math.sin(angle);

        newNodes.set(follower.login, {
          id: follower.login,
          login: follower.login,
          avatar_url: follower.avatar_url,
          x,
          y,
        });
      }

      const edgeId = `${follower.login}->${user.login}`;
      if (!newEdges.has(edgeId)) {
        newEdges.set(edgeId, {
          id: edgeId,
          source: follower.login,
          target: user.login,
        });
      }
    });

    // Mark user as expanded
    const userNode = newNodes.get(user.login);
    if (userNode) {
      newNodes.set(user.login, { ...userNode, expanded: true });
    }

    set({ nodes: newNodes, edges: newEdges });
  },

  selectDistanceUser: (nodeId) => {
    const { distanceUser1, distanceUser2 } = get();

    if (!distanceUser1) {
      set({ distanceUser1: nodeId });
    } else if (!distanceUser2 && nodeId !== distanceUser1) {
      set({ distanceUser2: nodeId });
    } else if (nodeId === distanceUser1) {
      set({ distanceUser1: distanceUser2, distanceUser2: null });
    } else if (nodeId === distanceUser2) {
      set({ distanceUser2: null });
    } else {
      // Both slots filled, replace the second one
      set({ distanceUser2: nodeId });
    }

    // Clear any existing path when selection changes
    get().clearPath();
  },

  clearDistanceSelection: () => {
    set({ distanceUser1: null, distanceUser2: null });
    get().clearPath();
  },

  calculatePath: () => {
    const { nodes, edges, distanceUser1, distanceUser2 } = get();

    if (!distanceUser1 || !distanceUser2) {
      return;
    }

    const result = findShortestPath(nodes, edges, distanceUser1, distanceUser2);

    if (result.distance !== null) {
      // Mark path nodes and edges
      const pathNodesSet = new Set(result.path);
      const pathEdgesSet = new Set<string>();

      // Find edges that are part of the path
      for (let i = 0; i < result.path.length - 1; i++) {
        const current = result.path[i];
        const next = result.path[i + 1];

        // Check both directions since edges might be stored either way
        const edgeId1 = `${current}->${next}`;
        const edgeId2 = `${next}->${current}`;

        if (edges.has(edgeId1)) {
          pathEdgesSet.add(edgeId1);
        } else if (edges.has(edgeId2)) {
          pathEdgesSet.add(edgeId2);
        }
      }

      set({
        pathNodes: pathNodesSet,
        pathEdges: pathEdgesSet,
        pathList: result.path,
        distance: result.distance,
      });
    } else {
      set({
        pathNodes: new Set(),
        pathEdges: new Set(),
        pathList: [],
        distance: null,
        error: "No path found between these users",
      });
    }
  },

  clearPath: () => {
    set({
      pathNodes: new Set(),
      pathEdges: new Set(),
      pathList: [],
      distance: null,
    });
  },

  updateNodePosition: (nodeId, x, y) => {
    const { nodes } = get();
    const node = nodes.get(nodeId);
    if (node) {
      const newNodes = new Map(nodes);
      newNodes.set(nodeId, { ...node, x, y, fx: x, fy: y });
      set({ nodes: newNodes });
    }
  },

  reset: () => {
    set({
      ...initialState,
      nodes: new Map(),
      edges: new Map(),
      pathNodes: new Set(),
      pathEdges: new Set(),
    });
  },
}));
