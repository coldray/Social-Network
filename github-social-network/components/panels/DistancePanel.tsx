"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShortestPath } from "@/hooks/useShortestPath";
import { useGraphStore } from "@/store/graph-store";
import { X, ArrowRight, Route } from "lucide-react";

export function DistancePanel() {
  const {
    distanceUser1,
    distanceUser2,
    distance,
    getUser1Name,
    getUser2Name,
    clearDistanceSelection,
    calculatePath,
    clearPath,
  } = useShortestPath();

  const nodes = useGraphStore((state) => state.nodes);

  const user1 = distanceUser1 ? nodes.get(distanceUser1) : null;
  const user2 = distanceUser2 ? nodes.get(distanceUser2) : null;

  const canCalculate = distanceUser1 && distanceUser2;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click on two nodes to select them, then calculate the shortest path.
      </p>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Selected Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* User 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-medium text-amber-600">
                1
              </div>
              {user1 ? (
                <div className="flex items-center gap-2">
                  <img
                    src={user1.avatar_url}
                    alt={user1.login}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium">{user1.login}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Click a node to select
                </span>
              )}
            </div>
            {user1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  useGraphStore.getState().selectDistanceUser(distanceUser1!);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* User 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-medium text-amber-600">
                2
              </div>
              {user2 ? (
                <div className="flex items-center gap-2">
                  <img
                    src={user2.avatar_url}
                    alt={user2.login}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium">{user2.login}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Click a node to select
                </span>
              )}
            </div>
            {user2 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  useGraphStore.getState().selectDistanceUser(distanceUser2!);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={calculatePath}
          disabled={!canCalculate}
        >
          <Route className="h-4 w-4 mr-2" />
          Calculate Path
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            clearDistanceSelection();
            clearPath();
          }}
          disabled={!distanceUser1 && !distanceUser2}
        >
          Clear
        </Button>
      </div>

      {/* Result */}
      {distance !== null && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {distance}
              </div>
              <div className="text-sm text-muted-foreground">
                {distance === 1 ? "degree of separation" : "degrees of separation"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {getUser1Name()} → {getUser2Name()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {distance === null && distanceUser1 && distanceUser2 && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="pt-4">
            <p className="text-sm text-center text-red-600 dark:text-red-400">
              No path found between these users in the current graph.
              Try expanding more nodes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
