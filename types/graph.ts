import { GitHubUser } from "./github";

export interface GraphNode {
  id: string;
  login: string;
  avatar_url: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  // Additional user data (populated when user info is fetched)
  userData?: GitHubUser;
  // Whether this node has been expanded (followers fetched)
  expanded?: boolean;
  // Whether this node is part of the highlighted path
  inPath?: boolean;
  // Size multiplier for visual variation (0.7 - 1.3)
  sizeMultiplier?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  // Whether this edge is part of the highlighted path
  inPath?: boolean;
}

export type Mode = "expand" | "explore" | "distance";

export type GitHubNodeData = {
  login: string;
  avatar_url: string;
  isRoot: boolean;
  expanded: boolean;
  isHovered: boolean;
  isDistanceUser: boolean;
  isInPath: boolean;
  mode: Mode;
  [key: string]: unknown;
};

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}
