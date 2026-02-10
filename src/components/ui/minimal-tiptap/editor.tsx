"use client"

import * as React from "react"
import { type Editor, useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import { cn } from "@/lib/utils"
import { Toolbar } from "./toolbar"
import "./styles.module.css"

interface MinimalTiptapEditorProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    editorClassName?: string
}

export function MinimalTiptapEditor({
    value = "",
    onChange,
    placeholder = "Start writing...",
    className,
    editorClassName,
}: MinimalTiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Image,
            Youtube.configure({
                controls: false,
                nocookie: true,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        immediatelyRender: false,
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[150px] p-4",
                    editorClassName
                ),
            },
        },
        onUpdate: ({ editor }: { editor: Editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    // Sync external value changes if needed
    // React.useEffect(() => {
    //   if (editor && value !== editor.getHTML()) {
    //     editor.commands.setContent(value)
    //   }
    // }, [value, editor])

    if (!editor) {
        return null
    }

    return (
        <div
            className={cn(
                "flex min-h-[250px] w-full flex-col rounded-md border border-input bg-background shadow-sm",
                className
            )}
        >
            <Toolbar editor={editor} />
            <EditorContent editor={editor} className="flex-1" />
        </div>
    )
}
