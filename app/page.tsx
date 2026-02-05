"use client";

import { NetworkGraph } from "@/components/graph/NetworkGraph";
import { UserSearch } from "@/components/search/UserSearch";
import { UserInfoPanel } from "@/components/panels/UserInfoPanel";
import { DistancePanel } from "@/components/panels/DistancePanel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGraphStore } from "@/store/graph-store";

export default function Home() {
  const { mode, setMode } = useGraphStore();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-lg font-semibold">GitHub Network</h1>
          <ThemeToggle />
        </div>

        <div className="p-4 border-b">
          <UserSearch />
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "expand" | "explore" | "distance")} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4" style={{ width: "calc(100% - 2rem)" }}>
              <TabsTrigger value="expand">Expand</TabsTrigger>
              <TabsTrigger value="explore">Explore</TabsTrigger>
              <TabsTrigger value="distance">Distance</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="expand" className="mt-0">
                <p className="text-sm text-muted-foreground">
                  Click on any node to expand and show their followers.
                </p>
              </TabsContent>

              <TabsContent value="explore" className="mt-0">
                <UserInfoPanel />
              </TabsContent>

              <TabsContent value="distance" className="mt-0">
                <DistancePanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative">
        <NetworkGraph />
      </div>
    </div>
  );
}
