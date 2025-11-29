import { QueryClient, keepPreviousData } from "@tanstack/react-query";
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
