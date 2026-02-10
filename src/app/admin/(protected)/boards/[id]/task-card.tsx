"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TaskCard({ task }: { task: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <Card 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners}
        className="cursor-grab hover:shadow-md transition-all active:cursor-grabbing group bg-card"
    >
        <CardContent className="p-3 space-y-2">
            <div className="flex justify-between items-start gap-2">
                 <p className="text-sm font-medium leading-tight">{task.title}</p>
                 {task.priority === 'high' && <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />}
            </div>
            
            <div className="flex flex-wrap gap-1">
                {task.aiTags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px] py-0 h-5 px-1.5 border-primary/20 text-primary">
                        {tag}
                    </Badge>
                ))}
                {task.priority && task.priority !== 'high' && (
                     <Badge variant="secondary" className="text-[10px] py-0 h-5 px-1.5 capitalize">{task.priority}</Badge>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
