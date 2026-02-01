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
    addUserWithFollowers,
    updateNodeData,
    setSelectedNode,
    setLoading,
    setError,
  } = useGraphStore();

  const { fetchUser, fetchFollowers, searchUsers } = useGitHubUser();

  const initializeWithUser = useCallback(
    async (username: string) => {
      setLoading(true);
      setError(null);

      try {
        const user = await fetchUser(username);
        if (!user) {
          setError("User not found");
          return;
        }

        const followers = await fetchFollowers(username, 1, 20);

        addUserWithFollowers(
          { login: user.login, avatar_url: user.avatar_url },
          followers
        );

        updateNodeData(user.login, user);
        setSelectedNode(user.login);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize graph");
      } finally {
        setLoading(false);
      }
    },
    [fetchUser, fetchFollowers, addUserWithFollowers, updateNodeData, setSelectedNode, setLoading, setError]
  );

  const expandNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.get(nodeId);
      if (!node || node.expanded) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const followers = await fetchFollowers(nodeId, 1, 20);
        addUserWithFollowers({ login: node.login, avatar_url: node.avatar_url }, followers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to expand node");
      } finally {
        setLoading(false);
      }
    },
    [nodes, fetchFollowers, addUserWithFollowers, setLoading, setError]
  );

  const selectAndFetchUserInfo = useCallback(
    async (nodeId: string) => {
      setSelectedNode(nodeId);

      const node = nodes.get(nodeId);
      if (node && !node.userData) {
        try {
          const user = await fetchUser(nodeId);
          if (user) {
            updateNodeData(nodeId, user);
          }
        } catch {
          // Silently fail, user info is optional
        }
      }
    },
    [nodes, fetchUser, updateNodeData, setSelectedNode]
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
