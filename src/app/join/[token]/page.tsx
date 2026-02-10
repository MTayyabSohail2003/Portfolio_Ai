"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function JoinWorkspacePage() {
    const params = useParams();
    const router = useRouter();
    // Use auth hook (adjust based on actual auth implementation, assuming typical next-auth or custom hooks)
    // Since I don't see exact auth hook usage in previous files (other than middleware), I'll check session generic way.
    // Ideally we should import basic user info. I'll mock a simple session check or rely on the user being logged in due to protected routes/middleware

    // NOTE: If this page handles auth redirect, it needs to know user email. 
    // I will fetch the user session client-side.
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch session (simulated or real)
    useEffect(() => {
        async function fetchSession() {
            try {
                const res = await fetch("/api/auth/session"); // Standard NextAuth route, or custom
                if (res.ok) {
                    const session = await res.json();
                    if (session?.user?.email) {
                        setUserEmail(session.user.email);
                        setStatus("ready");
                    } else {
                        // Redirect to login if not logged in
                        // For now, let's show a "Please login" message
                        setStatus("error");
                        setErrorMsg("You must be logged in to join a workspace.");
                    }
                } else {
                    setStatus("error");
                    setErrorMsg("You must be logged in to join a workspace.");
                }
            } catch (e) {
                setStatus("error");
                setErrorMsg("Failed to verify session.");
            }
        }
        fetchSession();
    }, []);

    const handleJoin = async () => {
        if (!userEmail) return;
        setStatus("loading");

        try {
            const res = await fetch("/api/workspaces/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: params.token, userEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to join workspace");
            }

            setStatus("success");
            toast.success("Joined workspace successfully!");
            setTimeout(() => {
                router.push(`/admin/workspaces/${data.workspaceId}`);
            }, 1000);

        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (status === "error" && errorMsg.includes("logged in")) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-xl">Authentication Required</CardTitle>
                        <CardDescription>You need to be logged in to accept this invitation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="/auth/signin?callbackUrl=">
                            <Button className="w-full">Log In / Sign Up</Button>
                        </Link>
                        <p className="text-xs text-muted-foreground">After logging in, click the invitation link again.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Invitation Error
                        </CardTitle>
                        <CardDescription>{errorMsg}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline" className="w-full">Go Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md border-green-500/50 bg-green-50/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="h-5 w-5" />
                            Joined Successfully
                        </CardTitle>
                        <CardDescription>Redirecting you to the workspace...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Join Workspace</CardTitle>
                    <CardDescription>
                        You have been invited to join a workspace using <strong>{userEmail}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleJoin} className="w-full" size="lg">
                        Accept & Join
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
