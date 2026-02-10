"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { SearchFilter } from "@/components/ui/search-filter"; // Assuming this exists now
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface BlogClientProps {
  initialBlogs: any[];
}

export default function BlogClient({ initialBlogs }: BlogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Compute available tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    initialBlogs.forEach(b => b.tags.forEach((t: string) => tags.add(t)));
    return Array.from(tags).sort();
  }, [initialBlogs]);

  // Filter logic
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => post.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [initialBlogs, searchQuery, selectedTags]);

  return (
    <div className="space-y-6">
       <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
      />

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBlogs.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-muted/10 border-dashed">
                <div className="bg-muted rounded-full p-4 mb-4">
                    <SearchX className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-foreground">No articles found</p>
                <p className="text-sm mb-4">Try searching for a different topic.</p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedTags([]); }}>Clear filters</Button>
            </div>
        ) : (
            filteredBlogs.map((post: any) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <Card className="h-full hover:border-primary/50 transition-all flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-wrap gap-1">
                                    {post.tags.slice(0, 2).map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
                                </span>
                            </div>
                            <CardTitle className="leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grow">
                            <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                        </CardContent>
                        <CardFooter className="mt-auto pt-4">
                            <span className="text-xs text-muted-foreground font-medium">{post.readTime || "5 min read"}</span>
                        </CardFooter>
                    </Card>
                </Link>
            ))
        )}
      </div>
    </div>
  );
}
