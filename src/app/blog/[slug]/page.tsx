import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db/connect";
import Blog from "@/lib/db/models/Blog";
import { format } from "date-fns";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const post = await Blog.findOne({ slug, published: true });
    if (!post) return { title: "Not Found" };
    return {
        title: `${post.title} | Muhammad Tayyab Sohail`,
        description: post.excerpt,
    };
}

async function getBlogPost(slug: string) {
    await dbConnect();
    const post = await Blog.findOne({ slug, published: true }).lean();
    if (!post) return null;
    return JSON.parse(JSON.stringify(post));
}

export default async function BlogPostPage({ params }: { params: Params }) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="max-w-3xl mx-auto py-10">
            <Button variant="ghost" asChild className="mb-6 pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
            </Button>

            <div className="space-y-4 text-center mb-10">
                <div className="flex justify-center gap-2">
                    {post.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{post.title}</h1>
                <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime || "5 min read"}
                    </span>
                </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    );
}
