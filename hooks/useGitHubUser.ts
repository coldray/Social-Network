"use client";

import { useState, useCallback } from "react";
import { GitHubUser, GitHubFollower, GitHubUserSearchResult } from "@/types/github";

export function useGitHubUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (username: string): Promise<GitHubUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/github/user?username=${encodeURIComponent(username)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch user");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowers = useCallback(async (
    username: string,
    page = 1,
    perPage = 30
  ): Promise<GitHubFollower[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/github/followers?username=${encodeURIComponent(username)}&page=${page}&per_page=${perPage}`
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch followers");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch followers");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string): Promise<GitHubUserSearchResult[]> => {
    if (!query.trim()) {
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/github/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to search users");
      }
      const data = await response.json();
      return data.items;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search users");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchUser,
    fetchFollowers,
    searchUsers,
  };
}
