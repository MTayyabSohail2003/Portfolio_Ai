"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Eye, FileText, CheckCircle2, CircleDashed } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import Link from "next/link";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  publishedAt: string;
  createdAt: string;
  author: string;
}

export default function BlogManagerPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      // Fetch with admin=true to get drafts too
      const res = await fetch("/api/blog?admin=true");
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    const toastId = toast.loading("Deleting...");
    try {
      await fetch(`/api/blog/${blogToDelete}`, { method: "DELETE" });
      toast.success("Deleted", { id: toastId });
      setBlogs(blogs.filter((b) => b._id !== blogToDelete));
    } catch (error) {
        toast.error("Failed to delete", { id: toastId });
    } finally {
        setBlogToDelete(null);
    }
  };

  const filteredBlogs = (status: "all" | "published" | "draft") => {
      if (status === "all") return blogs;
      if (status === "published") return blogs.filter(b => b.published);
      return blogs.filter(b => !b.published);
  };

  const BlogList = ({ status }: { status: "all" | "published" | "draft" }) => {
      const items = filteredBlogs(status);

      if (items.length === 0) {
          return (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <div className="flex justify-center mb-4">
                    {status === 'draft' ? <CircleDashed className="w-12 h-12 opacity-20" /> : <FileText className="w-12 h-12 opacity-20" />}
                </div>
                <h3 className="text-lg font-medium">No posts found</h3>
                <p className="text-sm">
                    {status === 'draft' ? "You don't have any drafts." : "Get started by creating a new post."}
                </p>
            </div>
          );
      }

      return (
          <div className="space-y-4">
              {items.map(blog => (
                  <div key={blog._id} className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:bg-muted/50 ${!blog.published ? 'bg-muted/30 border-dashed' : ''}`}>
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg">{blog.title}</h3>
                              <div className="flex gap-2">
                                  {blog.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                                  
                                  {blog.published ? (
                                      <Badge variant="default" className="bg-green-600/10 text-green-600 hover:bg-green-600/20 border-green-600/20">
                                          <CheckCircle2 className="w-3 h-3 mr-1" /> Published
                                      </Badge>
                                  ) : (
                                      <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                                          <CircleDashed className="w-3 h-3 mr-1" /> Draft
                                      </Badge>
                                  )}
                              </div>
                          </div>
                          <div className="text-sm text-muted-foreground flex gap-4 items-center">
                              <span>{format(new Date(blog.publishedAt || blog.createdAt), "MMM d, yyyy")}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                              <span className="font-mono text-xs">{blog.slug}</span>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                              <Button variant="ghost" size="icon" title="View Live" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <Eye className="w-4 h-4" />
                              </Button>
                          </Link>
                          <Link href={`/admin/blog/${blog._id}`}>
                              <Button variant="ghost" size="icon" title="Edit" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <Edit className="w-4 h-4" />
                              </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={() => setBlogToDelete(blog._id)}>
                              <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <ConfirmModal 
        isOpen={!!blogToDelete}
        onClose={() => setBlogToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post?"
      />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Blog Manager</h2>
            <p className="text-muted-foreground">Manage your content pipeline.</p>
        </div>
        <Link href="/admin/blog/new">
            <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Post
            </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
         <div className="flex items-center justify-between mb-4">
             <TabsList>
                <TabsTrigger value="all">
                    All <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{blogs.length}</span>
                </TabsTrigger>
                <TabsTrigger value="published">
                    Published <span className="ml-2 text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full">{blogs.filter(b => b.published).length}</span>
                </TabsTrigger>
                <TabsTrigger value="draft">
                    Drafts <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{blogs.filter(b => !b.published).length}</span>
                </TabsTrigger>
             </TabsList>
         </div>

         <Card>
            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                ) : (
                    <>
                        <TabsContent value="all" className="mt-0">
                            <BlogList status="all" />
                        </TabsContent>
                        <TabsContent value="published" className="mt-0">
                            <BlogList status="published" />
                        </TabsContent>
                        <TabsContent value="draft" className="mt-0">
                            <BlogList status="draft" />
                        </TabsContent>
                    </>
                )}
            </CardContent>
         </Card>
      </Tabs>
    </div>
  );
}
