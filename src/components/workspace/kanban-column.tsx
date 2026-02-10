"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnProps {
    column: any;
    tasks: any[];
}

export function KanbanColumn({ column, tasks }: ColumnProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const taskIds = tasks.map(t => t._id);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "w-[280px] flex-shrink-0 bg-muted/50 rounded-lg flex flex-col max-h-full border",
                isDragging && "opacity-50 ring-2 ring-primary"
            )}
        >
            {/* Header */}
            <div 
                {...attributes} 
                {...listeners} 
                className="p-3 font-semibold text-sm flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-muted rounded-t-lg transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color || "#ccc" }} />
                    {column.title}
                    <span className="text-xs text-muted-foreground ml-1">({tasks.length})</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="w-3 h-3" />
                </Button>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <KanbanCard key={task._id} task={task} />
                    ))}
                </SortableContext>
            </div>

            {/* Footer */}
            <div className="p-2">
                 <Button variant="ghost" className="w-full justify-start text-muted-foreground h-8 text-xs">
                    <Plus className="mr-2 h-3 w-3" /> Add Task
                 </Button>
            </div>
        </div>
    );
}
