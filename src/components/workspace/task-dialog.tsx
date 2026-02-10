"use client";

import { useState } from "react";
import { GravityModal } from "@/components/ui/gravity-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Plus, X, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createTask, generateTaskAIProposal } from "@/app/actions/task-actions";
import { Badge } from "@/components/ui/badge";

interface TaskDialogProps {
    board: any;
}

export function TaskDialog({ board }: TaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [status, setStatus] = useState(board.columns[0]?.id || "");
    const [assignee, setAssignee] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [subtasks, setSubtasks] = useState<{title: string, completed: boolean}[]>([]);
    const [newSubtask, setNewSubtask] = useState("");

    const handleAIEnrich = async () => {
        if (!title) {
            toast.error("Please enter a title first");
            return;
        }
        setAiLoading(true);
        const res = await generateTaskAIProposal(title, description);
        setAiLoading(false);

        if (res.success && res.data) {
            setTags(prev => [...new Set([...prev, ...res.data.tags])]);
            if (res.data.summary && !description) {
                setDescription(res.data.summary);
            }
            if (res.data.subtasks && res.data.subtasks.length > 0 && subtasks.length === 0) {
                setSubtasks(res.data.subtasks);
            }
            toast.success("AI Enrichment Complete");
        } else {
            toast.error(res.error || "AI failed");
        }
    };

    const onSubmit = async () => {
        if (!title || !status) {
             toast.error("Title and Status are required");
             return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("boardId", board._id);
        formData.append("columnId", status);
        formData.append("priority", priority);
        if (assignee) formData.append("assigneeId", assignee);
        formData.append("tags", JSON.stringify(tags));
        formData.append("subtasks", JSON.stringify(subtasks));

        const res = await createTask(formData);
        setLoading(false);

        if (res.success) {
            toast.success("Task Created");
            setOpen(false);
            // Reset form
            setTitle("");
            setDescription("");
            setTags([]);
            setSubtasks([]);
        } else {
            toast.error(res.error);
        }
    };

    return (
        <GravityModal
            open={open}
            onOpenChange={setOpen}
            title="Create Task"
            description="Add a new task to your board."
            trigger={<Button size="sm"><Plus className="w-4 h-4 mr-2"/> New Task</Button>}
        >
            <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label>Title</Label>
                    <div className="flex gap-2">
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="e.g. Implement Auth" 
                        />
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleAIEnrich} 
                            disabled={aiLoading}
                            title="Auto-generate tags & subtasks"
                            className="shrink-0"
                        >
                            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-purple-500" />}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent className="z-[200]">
                                {board.columns.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent className="z-[200]">
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        rows={3} 
                        placeholder="Task details..." 
                    />
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs">
                                {tag}
                                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 hover:text-red-500"><X className="h-3 w-3"/></button>
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="space-y-2">
                     <Label>Subtasks</Label>
                     <div className="flex gap-2">
                         <Input 
                            value={newSubtask} 
                            onChange={e => setNewSubtask(e.target.value)} 
                            placeholder="Add subtask..." 
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newSubtask.trim()) {
                                        setSubtasks([...subtasks, { title: newSubtask, completed: false }]);
                                        setNewSubtask("");
                                    }
                                }
                            }}
                         />
                         <Button type="button" size="icon" variant="ghost" onClick={() => {
                             if (newSubtask.trim()) {
                                 setSubtasks([...subtasks, { title: newSubtask, completed: false }]);
                                 setNewSubtask("");
                             }
                         }}>
                             <Plus className="h-4 w-4" />
                         </Button>
                     </div>
                     <div className="space-y-1 max-h-[100px] overflow-y-auto">
                         {subtasks.map((st, i) => (
                             <div key={i} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                                 <input type="checkbox" checked={st.completed} onChange={() => {
                                     const newSt = [...subtasks];
                                     newSt[i].completed = !newSt[i].completed;
                                     setSubtasks(newSt);
                                 }} />
                                 <span className={st.completed ? "line-through text-muted-foreground" : ""}>{st.title}</span>
                                 <button onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="ml-auto text-muted-foreground hover:text-red-500">
                                     <X className="h-3 w-3" />
                                 </button>
                             </div>
                         ))}
                     </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Task
                    </Button>
                </div>
            </div>
        </GravityModal>
    );
}
