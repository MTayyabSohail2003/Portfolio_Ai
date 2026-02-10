"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, Users } from "lucide-react";
import { CreateBoardDialog } from "./create-board-dialog";
import { format } from "date-fns";

interface WorkspaceHeaderProps {
    workspace: any;
    onSettingsClick?: () => void;
}

export function WorkspaceHeader({ workspace, onSettingsClick }: WorkspaceHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-transparent" />

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                {workspace.name}
                            </h1>
                            <Badge variant="outline" className="h-6">
                                Workspace
                            </Badge>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            {workspace.description || "Manage your projects and team collaboration in one place."}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4" />
                            <span>{workspace.members?.length || 0} Members</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                            <Calendar className="h-4 w-4" />
                            <span>Created {workspace.createdAt ? format(new Date(workspace.createdAt), "MMM d, yyyy") : "Recently"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button variant="outline" onClick={onSettingsClick} className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                    {/* We'll need to make sure CreateBoardDialog is exported properly or passed as children */}
                    <CreateBoardDialog workspaceId={workspace.id} />
                </div>
            </div>
        </div>
    );
}
