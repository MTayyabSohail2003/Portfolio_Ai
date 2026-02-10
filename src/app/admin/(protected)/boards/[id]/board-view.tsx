"use client";

import { useState, useOptimistic } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, Table as TableIcon, Sparkles, Coffee } from "lucide-react";
import { KanbanBoard } from "./kanban-board";
import { ListView } from "./list-view";
import { createTask, updateTaskOrder } from "@/app/actions/board-actions";
import { toast } from "sonner";
import { TaskDialog } from "./task-dialog";
import { BulkTaskDialog } from "./bulk-task-dialog";
import { StandupModal } from "./standup-modal";

export function BoardView({ board }: { board: any }) {
  const [activeTab, setActiveTab] = useState("board");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isStandupOpen, setIsStandupOpen] = useState(false);
  
  // Define types locally for safety
  type Task = { _id: string; columnId: string; order: number; [key: string]: any };
  type Column = { id: string; tasks: Task[]; [key: string]: any };
  type BoardState = { columns: Column[]; [key: string]: any };
  type BoardAction = 
    | { type: 'MOVE_TASK'; payload: { taskId: string; newColId: string; newOrder: number } }
    | { type: 'ADD_TASK'; payload: { columnId: string; [key: string]: any } };

  // Optimistic State
  const [optimisticBoard, setOptimisticBoard] = useOptimistic<BoardState, BoardAction>(
    board,
    (state, action) => {
        if (action.type === 'MOVE_TASK') {
            const { taskId, newColId, newOrder } = action.payload;
            // Deep clone
            const newState: BoardState = JSON.parse(JSON.stringify(state));
            
            // Find task and remove from old column
            let task: Task | undefined;
            newState.columns.forEach((col) => {
                if (!col.tasks) col.tasks = [];
                const idx = col.tasks.findIndex((t) => t._id === taskId);
                if (idx !== -1) {
                    task = col.tasks.splice(idx, 1)[0];
                }
            });

            // Add to new column
            if (task) {
                task.columnId = newColId;
                task.order = newOrder;
                const newCol = newState.columns.find((c) => c.id === newColId);
                if (newCol) {
                    if (!newCol.tasks) newCol.tasks = [];
                    newCol.tasks.push(task);
                    newCol.tasks.sort((a, b) => a.order - b.order);
                }
            }
            return newState;
        }
        if (action.type === 'ADD_TASK') {
             const newState: BoardState = JSON.parse(JSON.stringify(state));
             const col = newState.columns.find((c) => c.id === action.payload.columnId);
             if (col) {
                if (!col.tasks) col.tasks = [];
                col.tasks.push(action.payload as Task);
             }
             return newState;
        }
        return state;
    }
  );

  async function handleCreateTask(data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    formData.append("boardId", board._id);

    // Optimistic Add
    setOptimisticBoard({ type: 'ADD_TASK', payload: { ...data, _id: 'temp-' + Date.now(), boardId: board._id } });
    setIsDialogOpen(false);

    const res = await createTask(formData);
    if (res.error) {
        toast.error(res.error);
        // Revert? (Automatic by Next.js revalidation usually)
    } else {
        toast.success("Task created");
    }
  }

  async function handleMoveTask(taskId: string, newColId: string, newOrder: number) {
      setOptimisticBoard({ type: 'MOVE_TASK', payload: { taskId, newColId, newOrder } });
      await updateTaskOrder(taskId, newColId, newOrder, board._id);
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
          <TabsList>
            <TabsTrigger value="board"><LayoutTemplate className="h-4 w-4 mr-2"/> Board</TabsTrigger>
            <TabsTrigger value="list"><TableIcon className="h-4 w-4 mr-2"/> List</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
            <Button variant="ghost" size="icon" title="Daily Standup" onClick={() => setIsStandupOpen(true)}>
                <Coffee className="h-4 w-4 text-orange-500" />
            </Button>
            <Button variant="outline" onClick={() => setIsBulkOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4 text-indigo-500" /> Bulk Add
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "board" && (
            <KanbanBoard board={optimisticBoard} onMoveTask={handleMoveTask} />
        )}
        {activeTab === "list" && (
            <ListView board={optimisticBoard} />
        )}
      </div>

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSubmit={handleCreateTask}
        columns={board.columns}
      />
      <BulkTaskDialog
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        boardId={board._id}
      />
      <StandupModal
        open={isStandupOpen}
        onOpenChange={setIsStandupOpen}
        boardId={board._id}
      />
    </div>
  );
}
