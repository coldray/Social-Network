"use client";

import { useGraphStore } from "@/store/graph-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Building2,
  Users,
  GitFork,
  Calendar,
  ExternalLink,
} from "lucide-react";

export function UserInfoPanel() {
  const { nodes, selectedNode } = useGraphStore();

  if (!selectedNode) {
    return (
      <div className="text-sm text-muted-foreground">
        Click on a node to view user details
      </div>
    );
  }

  const node = nodes.get(selectedNode);

  if (!node) {
    return null;
  }

  const userData = node.userData;

  if (!userData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  const joinDate = new Date(userData.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <img
            src={userData.avatar_url}
            alt={userData.login}
            className="h-12 w-12 rounded-full"
          />
          <div>
            <CardTitle className="text-lg">{userData.name || userData.login}</CardTitle>
            <a
              href={userData.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              @{userData.login}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {userData.bio && (
          <p className="text-sm text-muted-foreground">{userData.bio}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              <strong className="text-foreground">{userData.followers}</strong> followers
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              <strong className="text-foreground">{userData.following}</strong> following
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {userData.company && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>{userData.company}</span>
            </div>
          )}

          {userData.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{userData.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <GitFork className="h-4 w-4 flex-shrink-0" />
            <span>{userData.public_repos} public repos</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Joined {joinDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
