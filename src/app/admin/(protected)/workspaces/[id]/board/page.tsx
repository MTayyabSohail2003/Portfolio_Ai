import { getBoardData } from "@/app/actions/task-actions";
import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/workspace/kanban-board";
import { TaskListView } from "@/components/workspace/task-list-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Filter, LayoutGrid, List } from "lucide-react";
import { BoardHeader } from "@/components/workspace/board-header";
import { TaskDialog } from "@/components/workspace/task-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { id } = await params;
  const { board, tasks, error } = await getBoardData(id);

  if (error || !board) {
    notFound();
  }

  // We can treat board.viewPreferences.defaultView as initial state
  const defaultView = board.viewPreferences?.defaultView || "board";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]"> {/* Full height minus header */}
      <BoardHeader board={board} />

      <Tabs defaultValue={defaultView} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-2 border-b bg-background flex items-center justify-between">
           <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="board"><LayoutGrid className="w-4 h-4 mr-2"/> Board</TabsTrigger>
              <TabsTrigger value="list"><List className="w-4 h-4 mr-2"/> List</TabsTrigger>
           </TabsList>
           
           <div className="flex items-center gap-2">
               <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2"/> Filter</Button>
               <Button variant="outline" size="sm"><Settings2 className="w-4 h-4 mr-2"/> Settings</Button>
               <TaskDialog board={board} />
           </div>
        </div>

        <TabsContent value="board" className="flex-1 overflow-hidden m-0 p-0 bg-muted/30">
            <KanbanBoard board={board} initialTasks={tasks} />
        </TabsContent>
        
        <TabsContent value="list" className="flex-1 overflow-hidden m-0 p-6 bg-background">
            <TaskListView board={board} initialTasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
