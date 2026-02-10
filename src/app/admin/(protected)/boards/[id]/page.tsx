
import { getBoardData } from "@/app/actions/board-actions";
import { BoardView } from "./board-view";
import { notFound } from "next/navigation";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { board, error } = await getBoardData(id);

  if (error || !board) {
    if (error === "Board not found") return notFound();
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold">{board.name}</h2>
        </div>
        <BoardView board={board} />
    </div>
  );
}
