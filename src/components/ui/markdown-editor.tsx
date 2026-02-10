"use client";

import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useRef } from "react";
import { toast } from "sonner";

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null); // To store the SimpleMDE instance

  // Custom Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const imageMarkdown = `![${file.name}](${base64String})`;
      
      // Insert into editor at cursor position
      if (editorRef.current) {
        const cm = editorRef.current.codemirror;
        const doc = cm.getDoc();
        const cursor = doc.getCursor();
        doc.replaceRange(imageMarkdown, cursor);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const options = useMemo(() => {
    return {
      placeholder: placeholder,
      spellChecker: false,
      status: false,
      autosave: {
        enabled: false,
        uniqueId: "blog_content",
        delay: 1000,
      },
      minHeight: "400px",
      toolbar: [
        "bold", "italic", "heading", "|", 
        "quote", "unordered-list", "ordered-list", "|",
        "link", 
        {
            name: "image-upload",
            action: (editor: any) => {
                // Save editor instance to use in callback
                editorRef.current = editor; 
                fileInputRef.current?.click();
            },
            className: "fa fa-picture-o",
            title: "Upload Image",
        },
        "|",
        "preview", "side-by-side", "fullscreen",
      ],
    };
  }, [placeholder]);

  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
      <SimpleMDE 
        value={value} 
        onChange={onChange} 
        options={options as any} 
        getMdeInstance={(instance) => {
            editorRef.current = instance;
        }}
      />
    </div>
  );
}
