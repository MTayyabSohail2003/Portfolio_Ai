"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    DndContext, 
    DragOverlay, 
    closestCorners, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    horizontalListSortingStrategy,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { moveTask } from "@/app/actions/task-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BoardProps {
    board: any;
    initialTasks: any[];
}

export function KanbanBoard({ board, initialTasks }: BoardProps) {
    const [tasks, setTasks] = useState(initialTasks);
    // Columns are from board config. 
    // If board has no columns (legacy), we might need defaults? 
    // The model update ensures we have columns.
    const [columns, setColumns] = useState(board.columns || []); 
    
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 } // Prevent accidental drags
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Derived state: Column IDs
    const columnIds = useMemo(() => columns.map((c: any) => c.id), [columns]);

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setActiveTask(tasks.find((t: any) => t._id === active.id) || null);
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks: any[]) => {
                const activeIndex = tasks.findIndex((t) => t._id === activeId);
                const overIndex = tasks.findIndex((t) => t._id === overId);
                
                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    // Moving to different column
                    tasks[activeIndex].columnId = tasks[overIndex].columnId;
                    return arrayMove(tasks, activeIndex, overIndex - 1); 
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
             setTasks((tasks: any[]) => {
                const activeIndex = tasks.findIndex((t) => t._id === activeId);
                const activeTask = tasks[activeIndex];
                if (activeTask.columnId !== overId) {
                     activeTask.columnId = overId as string;
                     // Move to end of that column? Or handled by sorting strategy?
                     return [...tasks]; 
                }
                return tasks;
             });
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find((t: any) => t._id === activeId);
        if (!activeTask) return;

        // Calculate new order and column
        // We need to persist this.
        // For simplicity in MVP, we might just update the columnId if changed, 
        // and if order changed, we assume the array index reflects it?
        // Real implementation needs to calculate the precise 'order' float/int.

        const newColumnId = activeTask.columnId;
        // Find index in the new column
        const tasksInColumn = tasks.filter((t: any) => t.columnId === newColumnId);
        const newIndex = tasksInColumn.findIndex((t: any) => t._id === activeId);
        
        // Simple order logic: Index * 1000 + 1000
        const newOrder = (newIndex + 1) * 1000; 

        try {
            await moveTask(activeId, newColumnId, newOrder, board._id);
        } catch (e) {
            toast.error("Failed to save move");
            // Revert state?
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="h-full flex gap-4 p-6 overflow-x-auto items-start">
                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                     {columns.map((col: any) => (
                         <KanbanColumn 
                            key={col.id} 
                            column={col} 
                            tasks={tasks.filter((t: any) => t.columnId === col.id)} 
                         />
                     ))}
                </SortableContext>
                
                {/* Add Column Button */}
                <Button variant="ghost" className="min-w-[280px] h-[50px] border-2 border-dashed border-muted text-muted-foreground hover:text-foreground">
                    <Plus className="mr-2 h-4 w-4" /> Add Column
                </Button>
            </div>

            <DragOverlay>
                {activeTask ? (
                     <KanbanCard task={activeTask} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
