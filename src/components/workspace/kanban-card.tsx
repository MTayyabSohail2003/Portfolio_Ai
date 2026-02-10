"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Tag } from "lucide-react";

interface CardProps {
    task: any;
}

export function KanbanCard({ task }: CardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task._id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className={cn(
                "cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm",
                isDragging && "opacity-50 ring-2 ring-primary rotate-2"
            )}>
                <CardContent className="p-3 space-y-2">
                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag: string) => (
                                <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="text-sm font-medium leading-snug">
                        {task.title}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        {/* Priority Indicator */}
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            task.priority === "high" || task.priority === "urgent" ? "bg-red-500" :
                            task.priority === "low" ? "bg-green-500" : "bg-yellow-500"
                        )} title={task.priority} />

                        {/* Due Date or Assignee Avatar */}
                         {task.dueDate && (
                             <div className="flex items-center text-[10px] text-muted-foreground">
                                 <Calendar className="w-3 h-3 mr-1" />
                                 {new Date(task.dueDate).toLocaleDateString()}
                             </div>
                         )}
                         
                         {/* Assignees */}
                         {task.assignees && task.assignees.length > 0 && (
                             <div className="flex -space-x-1.5">
                                 {task.assignees.slice(0, 3).map((u: any) => (
                                     <img 
                                        key={u._id} 
                                        src={u.image || "https://github.com/shadcn.png"} 
                                        className="w-5 h-5 rounded-full ring-1 ring-background" 
                                        alt={u.name} 
                                     />
                                 ))}
                             </div>
                         )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
