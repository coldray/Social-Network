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

  // Add user and their followers
  addUserWithFollowers: (
    user: { login: string; avatar_url: string },
    followers: GitHubFollower[]
  ) => void;

  // Distance mode actions
  selectDistanceUser: (nodeId: string) => void;
  clearDistanceSelection: () => void;
  calculatePath: () => void;
  clearPath: () => void;

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
    const { nodes, edges, addNode, addEdge, markNodeExpanded } = get();

    // Add the main user node if not exists
    if (!nodes.has(user.login)) {
      addNode({
        id: user.login,
        login: user.login,
        avatar_url: user.avatar_url,
      });
    }

    // Add followers and edges
    followers.forEach((follower) => {
      if (!nodes.has(follower.login)) {
        addNode({
          id: follower.login,
          login: follower.login,
          avatar_url: follower.avatar_url,
        });
      }

      const edgeId = `${follower.login}->${user.login}`;
      if (!edges.has(edgeId)) {
        addEdge({
          id: edgeId,
          source: follower.login,
          target: user.login,
        });
      }
    });

    // Mark user as expanded
    markNodeExpanded(user.login);
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
        distance: result.distance,
      });
    } else {
      set({
        pathNodes: new Set(),
        pathEdges: new Set(),
        distance: null,
        error: "No path found between these users",
      });
    }
  },

  clearPath: () => {
    set({
      pathNodes: new Set(),
      pathEdges: new Set(),
      distance: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
