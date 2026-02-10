"use client";

import { useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { useState } from "react";
import { createPortal } from "react-dom";

export function KanbanBoard({ board, onMoveTask }: { board: any, onMoveTask: any }) {
  const [activeTask, setActiveTask] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: { distance: 5 } // Prevent accidental drags
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: any) {
    const { active } = event;
    const task = board.columns.flatMap((c: any) => c.tasks).find((t: any) => t._id === active.id);
    setActiveTask(task);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find columns
    const activeCol = board.columns.find((c: any) => c.tasks.some((t: any) => t._id === activeId));
    let overCol = board.columns.find((c: any) => c.id === overId); // Dropped on Column
    
    // If dropped on a task, find that task's column
    if (!overCol) {
        overCol = board.columns.find((c: any) => c.tasks.some((t: any) => t._id === overId));
    }

    if (!activeCol || !overCol) return;

    // Calculate new index
    let newIndex;
    if (overId === overCol.id) {
        // Dropped on column -> Add to end
        newIndex = overCol.tasks.length; 
    } else {
        // Dropped on task
        const overTaskIndex = overCol.tasks.findIndex((t: any) => t._id === overId);
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overTaskIndex >= 0 ? overTaskIndex + modifier : overCol.tasks.length + 1;
    }

    // Call Parent (Optimistic Update)
    onMoveTask(activeId, overCol.id, newIndex * 1000); // Simple order scaling
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
        {board.columns.map((col: any) => (
          <KanbanColumn key={col.id} column={col} />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
