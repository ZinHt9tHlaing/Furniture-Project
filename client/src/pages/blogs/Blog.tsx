import BlogPostList from "@/components/blogs/BlogPostList";
import { useInfiniteQuery } from "@tanstack/react-query";
import { postInfiniteQuery } from "@/api/query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Blog = () => {
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    // isFetchingPreviousPage,
    fetchNextPage,
    // fetchPreviousPage,
    hasNextPage,
    // hasPreviousPage,
  } = useInfiniteQuery(postInfiniteQuery());

  const allPages = data?.pages.flatMap((page) => page.posts) ?? [];

  if (status === "pending") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 max-w-4xl">
      <h1 className="mb-5 text-center text-3xl font-bold md:text-left">
        Latest Blog Posts
      </h1>

      <Card className="mb-6 rounded-2xl p-4 shadow-md">
        <CardContent>
          <BlogPostList posts={allPages} />
        </CardContent>
      </Card>

      <div className="my-4 flex justify-center">
        <Button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          variant={!hasNextPage ? "ghost" : "secondary"}
          className="cursor-pointer rounded-md px-6 py-2 text-lg shadow-sm duration-200 active:scale-90 disabled:cursor-not-allowed"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading more...
            </div>
          ) : hasNextPage ? (
            "Load More"
          ) : (
            "Nothing more to load"
          )}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        {isFetching && !isFetchingNextPage ? "Background Updating..." : null}
      </div>
    </div>
  );
};

export default Blog;
