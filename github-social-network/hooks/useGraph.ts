"use client";

import { useCallback } from "react";
import { useGraphStore } from "@/store/graph-store";
import { useGitHubUser } from "./useGitHubUser";

export function useGraph() {
  const {
    nodes,
    edges,
    mode,
    selectedNode,
    loading,
    error,
  } = useGraphStore();

  const { fetchUser, fetchFollowers, searchUsers } = useGitHubUser();

  const initializeWithUser = useCallback(
    async (username: string) => {
      console.log("initializeWithUser called with:", username);

      // Get fresh store actions
      const store = useGraphStore.getState();
      store.setLoading(true);
      store.setError(null);

      try {
        console.log("Fetching user...");
        const user = await fetchUser(username);
        console.log("User fetched:", user);

        if (!user) {
          console.log("User not found");
          store.setError("User not found");
          return;
        }

        console.log("Fetching followers...");
        const followers = await fetchFollowers(username, 1, 10);
        console.log("Followers fetched:", followers.length);

        console.log("Adding to graph...");
        store.addUserWithFollowers(
          { login: user.login, avatar_url: user.avatar_url },
          followers
        );

        store.updateNodeData(user.login, user);
        store.setSelectedNode(user.login);

        console.log("Graph initialized. Nodes:", useGraphStore.getState().nodes.size);
      } catch (err) {
        console.error("Error initializing:", err);
        store.setError(err instanceof Error ? err.message : "Failed to initialize graph");
      } finally {
        store.setLoading(false);
      }
    },
    [fetchUser, fetchFollowers]
  );

  const expandNode = useCallback(
    async (nodeId: string) => {
      console.log("expandNode called with:", nodeId);

      const store = useGraphStore.getState();
      const node = store.nodes.get(nodeId);

      if (!node) {
        console.log("Node not found:", nodeId);
        return;
      }

      if (node.expanded) {
        console.log("Node already expanded:", nodeId);
        return;
      }

      store.setLoading(true);
      store.setError(null);

      try {
        console.log("Fetching followers for:", nodeId);
        const followers = await fetchFollowers(nodeId, 1, 10);
        console.log("Followers fetched:", followers.length);

        store.addUserWithFollowers(
          { login: node.login, avatar_url: node.avatar_url },
          followers
        );

        console.log("Node expanded. Total nodes:", useGraphStore.getState().nodes.size);
      } catch (err) {
        console.error("Error expanding:", err);
        store.setError(err instanceof Error ? err.message : "Failed to expand node");
      } finally {
        store.setLoading(false);
      }
    },
    [fetchFollowers]
  );

  const selectAndFetchUserInfo = useCallback(
    async (nodeId: string) => {
      const store = useGraphStore.getState();
      store.setSelectedNode(nodeId);

      const node = store.nodes.get(nodeId);

      if (node && !node.userData) {
        try {
          const user = await fetchUser(nodeId);
          if (user) {
            store.updateNodeData(nodeId, user);
          }
        } catch {
          // Silently fail
        }
      }
    },
    [fetchUser]
  );

  return {
    nodes,
    edges,
    mode,
    selectedNode,
    loading,
    error,
    initializeWithUser,
    expandNode,
    selectAndFetchUserInfo,
    searchUsers,
  };
}
