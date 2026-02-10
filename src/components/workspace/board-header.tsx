"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function BoardHeader({ board }: { board: any }) {
    return (
        <div className="px-6 py-3 border-b bg-background/95 backdrop-blur flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
                <div 
                    className="h-10 w-10 rounded-md flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: board.background?.includes('http') ? `url(${board.background})` : (board.background || '#000') }}
                >
                    {board.name[0]}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                         <h1 className="text-xl font-bold">{board.name}</h1>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-yellow-500">
                             <Star className="w-4 h-4" />
                         </Button>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">{board.key}</span>
                        <span>Updated just now</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                 {/* Member Avatars would go here */}
            </div>
        </div>
    );
}
