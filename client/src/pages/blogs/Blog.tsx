import BlogPostList from "@/components/blogs/BlogPostList";
import { posts } from '../../data/posts';

const Blog = () => {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-center text-2xl font-bold md:text-left">
        Latest Blog Posts
      </h1>
      <BlogPostList posts={posts} />
    </div>
  );
};

export default Blog;
