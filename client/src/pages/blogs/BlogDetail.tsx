import { onePostQuery, postQuery } from "@/api/query";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import { Post, Tag } from "@/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLoaderData } from "react-router";

const BlogDetail = () => {
  // const { postId } = useParams();

  // const post = posts.find((post) => post.id === postId);

  const { postId } = useLoaderData();

  const { data: postsData } = useSuspenseQuery(postQuery(`?id=${postId}`));
  const { data: postDetailData } = useSuspenseQuery(onePostQuery(+postId));

  const imageUrl = import.meta.env.VITE_IMG_URL;

  return (
    <div className="container mx-auto px-4 lg:px-0">
      <section className="flex flex-col lg:flex-row">
        <section className="w-full lg:w-3/4 lg:pr-16">
          <Button
            variant={"outline"}
            asChild
            className="group mt-8 mb-6 duration-200 active:scale-90"
          >
            <Link to="/blogs">
              <Icons.arrowLeft className="duration-200 group-hover:-translate-x-1" />
              All Posts
            </Link>
          </Button>
          {postDetailData ? (
            <>
              <h2 className="mb-3 text-3xl font-extrabold">
                {postDetailData.post.title}
              </h2>
              <div className="text-sm">
                <span>
                  by
                  <span className="font-[600]">
                    {" "}
                    {postDetailData.post.author.fullName}{" "}
                  </span>
                  on {" "}
                  <span className="font-[600]">
                    {postDetailData.post.updatedAt}
                  </span>
                </span>
              </div>
              <h3 className="my-6 text-base font-[400]">
                {postDetailData.post.content}
              </h3>
              <img
                src={imageUrl + postDetailData.post.image}
                alt={postDetailData.post.title}
                loading="lazy"
                decoding="async"
                className="w-full rounded-xl"
              />
              <p className="">{postDetailData.post.body}</p>
              <div className="mb-12 space-x-2">
                {postDetailData.post.tags.map((tag: Tag, index: number) => (
                  <Button variant={"secondary"} key={index}>
                    {tag.name}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground mt-8 mb-16 text-center text-xl font-bold lg:mt-24">
              No post found
            </p>
          )}
        </section>
        {/* other blog posts */}
        <section className="w-full lg:mt-24 lg:w-1/4">
          <div className="mb-8 flex items-center gap-4 text-base font-semibold">
            <Icons.layers />
            <h3 className="">Other Blog Posts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
            {postsData.posts.map((post: Post) => (
              <Link
                to={`/blogs/${post.id}`}
                key={post.id}
                className="mb-6 flex items-start gap-2"
              >
                <img
                  src={imageUrl + post.image}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="w-1/4 rounded"
                />
                <div className="text-muted-foreground w-3/4 text-sm font-[500]">
                  <p className="line-clamp-2">{post.content}</p>
                  <i>... see more</i>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};

export default BlogDetail;
