"use client";

import { useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskListViewProps {
    board: any;
    initialTasks: any[];
}

export function TaskListView({ board, initialTasks }: TaskListViewProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    
    // Define columns
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                  <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium px-4">{row.getValue("title")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const statusId = row.getValue("status");
                const col = board.columns.find((c: any) => c.id === statusId);
                return (
                    <Badge variant="outline" style={{ borderColor: col?.color }}>
                        {col?.title || statusId}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.getValue("priority") as string;
                return (
                    <Badge className={
                        priority === "urgent" ? "bg-red-500 hover:bg-red-600" :
                        priority === "high" ? "bg-orange-500 hover:bg-orange-600" :
                        priority === "medium" ? "bg-yellow-500 hover:bg-yellow-600" :
                        "bg-green-500 hover:bg-green-600"
                    }>
                        {priority}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "assignees",
            header: "Assignees",
            cell: ({ row }) => {
                const assignees = row.original.assignees || [];
                return (
                    <div className="flex -space-x-2">
                        {assignees.map((u: any) => (
                            <Avatar key={u._id} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={u.image} />
                                <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                     <Button variant="ghost" size="icon">
                         <MoreHorizontal className="w-4 h-4" />
                     </Button>
                )
            }
        }
    ];

    const table = useReactTable({
        data: initialTasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    return (
        <div className="rounded-md border h-full overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                          ? null
                                          : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
