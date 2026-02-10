"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Layout, MoreHorizontal, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface BoardCardProps {
    board: any;
}

export function BoardCard({ board }: BoardCardProps) {
    return (
        <Link href={`/admin/boards/${board.id}`} className="block h-full group">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <span className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <Layout className="h-4 w-4" />
                            </span>
                            {board.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1 text-xs">
                            {board.key || "BRD"} • Updated {formatDistanceToNow(new Date(), { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Board</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete Board</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    {/* Mock Task Progress */}
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                12/24 Tasks
                            </span>
                            <span>50%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-1/2 rounded-full" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-2 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {/* Mock Contributors for now */}
                        {[1, 2, 3].map((i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-[9px] bg-muted">U{i}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>

                    <Badge variant="secondary" className="text-[10px] font-normal hover:bg-secondary">
                        Active
                    </Badge>
                </CardFooter>
            </Card>
        </Link>
    );
}
