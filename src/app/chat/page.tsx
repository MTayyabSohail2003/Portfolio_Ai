"use client";

import dynamic from 'next/dynamic'

const ChatInterface = dynamic(() => import('@/components/features/chat-interface'), {
  loading: () => (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground animate-pulse">Initializing Neural Interface...</p>
        </div>
    </div>
  ),
  ssr: false
})

export default function ChatPage() {
  return <ChatInterface />
}
