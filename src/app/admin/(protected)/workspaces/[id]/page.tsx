"use client";

import { useQuery } from "@apollo/client/react";
import { GET_WORKSPACE } from "@/graphql/queries";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { WorkspaceHeader } from "../components/workspace-header";
import { WorkspaceStats } from "../components/workspace-stats";
import { BoardCard } from "../components/board-card";
import { MemberList } from "../components/member-list";
import { ActivityFeed } from "../components/activity-feed";

export default function WorkspaceDetailPage() {
    const params = useParams();
    const { data, loading, error } = useQuery<{ workspace: any }>(GET_WORKSPACE, { variables: { id: params.id } });

    if (loading) return (
        <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
        </div>
    );

    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">Error: {error.message}</div>;

    if (!data?.workspace) return <div className="p-8 text-center text-muted-foreground">Workspace not found</div>;
    const { workspace } = data;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <WorkspaceHeader workspace={workspace} />

            {/* Stats Overview */}
            <WorkspaceStats workspace={workspace} />

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="boards"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
                    >
                        Boards
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            {workspace.boards?.length || 0}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="members"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
                    >
                        Members
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            {workspace.members?.length || 0}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
                    >
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Recent Boards */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold tracking-tight">Recent Boards</h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {workspace.boards?.slice(0, 4).map((board: any) => (
                                    <BoardCard key={board.id} board={board} />
                                ))}
                                {workspace.boards?.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
                                        <p className="text-muted-foreground">No boards found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity Feed Sidebar */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold tracking-tight">Activity</h3>
                            <Card>
                                <CardContent className="p-6">
                                    <ActivityFeed />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* BOARDS TAB */}
                <TabsContent value="boards" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search boards..."
                                className="pl-9"
                            />
                        </div>
                        {/* Title handled by Header */}
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {workspace.boards?.map((board: any) => (
                            <BoardCard key={board.id} board={board} />
                        ))}
                    </div>
                </TabsContent>

                {/* MEMBERS TAB */}
                <TabsContent value="members" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage who has access to this workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MemberList members={workspace.members || []} workspaceId={workspace.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Manage workspace name and description.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="py-8 text-center text-muted-foreground">
                                Settings form can go here.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
