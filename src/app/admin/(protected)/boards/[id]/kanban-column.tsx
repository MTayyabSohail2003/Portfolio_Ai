"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function KanbanColumn({ column }: { column: any }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="w-80 shrink-0 flex flex-col h-full max-h-full">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-t-lg border-x border-t">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="secondary" className="text-xs">{column.tasks.length}</Badge>
        </div>
        <div 
            ref={setNodeRef} 
            className="flex-1 bg-muted/20 border-x border-b rounded-b-lg p-2 space-y-2 overflow-y-auto"
        >
            <SortableContext items={column.tasks.map((t: any) => t._id)} strategy={verticalListSortingStrategy}>
                {column.tasks.map((task: any) => (
                    <TaskCard key={task._id} task={task} />
                ))}
            </SortableContext>
        </div>
    </div>
  );
}
