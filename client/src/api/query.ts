import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import api from ".";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      // retry: 2, // default is 3
    },
  },
});

const fetchProducts = (query?: string) =>
  api.get(`/users/infinite/products${query ?? ""}`).then((res) => res.data);

export const productQuery = (query?: string) => ({
  queryKey: ["products", query], // products ?limit=8, products ?limit=8
  queryFn: () => fetchProducts(query),
});

const fetchPosts = (query?: string) =>
  api.get(`/users/posts/infinite${query ?? ""}`).then((res) => res.data);

export const postQuery = (query?: string) => ({
  queryKey: ["posts", query],
  queryFn: () => fetchPosts(query),
});

const fetchInfinitePosts = async ({ pageParam = null }) => {
  const query = pageParam ? `?limit=6&cursor=${pageParam}` : "?limit=6";
  const response = await api.get(`/users/posts/infinite${query}`);
  return response.data;
};

export const postInfiniteQuery = () => ({
  queryKey: ["posts", "infinite"],
  queryFn: fetchInfinitePosts,
  initialPageParam: null, // Start with no cursor
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined,
  // getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor ?? undefined,
  // maxPages: 7,
});

const fetchOnePost = async (id: number) => {
  const post = await api.get(`/users/post/${id}`);
  if (!post) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return post.data;
};

export const onePostQuery = (id: number) => ({
  queryKey: ["posts", "detail", id],
  queryFn: () => fetchOnePost(id),
});

const fetchCategoryType = async () =>
  api.get("/users/filter-type").then((res) => res.data);

export const categoryTypeQuery = () => ({
  queryKey: ["category", "type"],
  queryFn: fetchCategoryType,
});

const fetchInfiniteProducts = async ({
  pageParam = null, // for cursor
  categories = null,
  types = null,
}: {
  pageParam?: number | null;
  categories?: string | null;
  types?: string | null;
}) => {
  let query = pageParam ? `?limit=9&cursor=${pageParam}` : "?limit=9";
  if (categories) query += `&categories=${categories}`;
  if (types) query += `&types=${types}`;

  const response = await api.get(`/users/infinite/products${query}`);
  return response.data;
};

export const productInfiniteQuery =  (
  categories: string | null = null, // default null
  types: string | null = null,
) => ({
  queryKey: [
    "products",
    "infinite",
    categories ?? undefined,
    types ?? undefined,
  ],
  queryFn: ({ pageParam }: { pageParam?: number | null }) =>
    fetchInfiniteProducts({ pageParam, categories, types }),
  placeholderData: keepPreviousData, // keep previous data when refetch
  initialPageParam: null, // Start with no cursor
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined,
  // getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor ?? undefined,
  // maxPages: 7,
});
