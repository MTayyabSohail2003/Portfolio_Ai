"use client";

import { useQuery } from "@apollo/client/react";
import { GET_WORKSPACES } from "@/graphql/queries";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { CreateWorkspaceDialog } from "./create-dialog";

export default function WorkspacesPage() {
  const { data, loading, error } = useQuery<any>(GET_WORKSPACES);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  if (error) {
     return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Workspaces</h2>
            <p className="text-muted-foreground">Manage your teams and projects.</p>
        </div>
        <CreateWorkspaceDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.workspaces?.map((ws: any) => (
            <Card key={ws.id} className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        {ws.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                        {ws.description || "No description provided."}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                            {ws.members?.slice(0, 3).map((m: any) => (
                                <div key={m.user.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center overflow-hidden">
                                     {m.user.image ? (
                                        <img src={m.user.image} alt={m.user.name} className="h-full w-full object-cover" />
                                     ) : (
                                        <div className="text-[10px] font-medium text-muted-foreground">{m.user.name[0]}</div>
                                     )}
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground ml-1">
                             {ws.members?.length} Members
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-3">
                    <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
                        <Link href={`/admin/workspaces/${ws.id}`}>
                            View Boards <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
        {data.workspaces.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
                <h3 className="text-lg font-medium">No Workspaces Found</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first workspace to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
}
