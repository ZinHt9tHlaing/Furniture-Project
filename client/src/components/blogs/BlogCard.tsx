import { Post } from "@/types";
import { Link } from "react-router";

type PostProps = {
  posts: {
    posts: Post[];
  };
};

const imageUrl = import.meta.env.VITE_IMG_URL;

const BlogCard = ({ posts }: PostProps) => {
  return (
    <div className="my-8 grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-0">
      {posts.posts.slice(0, 3).map((post: Post) => (
        <div className="flex-col" key={post.id}>
          <Link to={`/blogs/${post.id}`} key={post.id}>
            <img
              src={imageUrl + post.image}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="mb-4 w-full rounded-2xl transition-all duration-500 ease-in-out lg:hover:scale-105"
            />
          </Link>
          <h3 className="ml-4 line-clamp-1 font-semibold">{post.title}</h3>
          <div className="mt-2 ml-4 text-sm">
            <span>
              by<span className="font-semibold"> {post.author.fullName} </span>
              on
              <span className="font-semibold"> {post.updatedAt}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogCard;
