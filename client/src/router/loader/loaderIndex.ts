import api, { authApi } from "@/api";
import {
  onePostQuery,
  postInfiniteQuery,
  postQuery,
  productQuery,
  queryClient,
} from "@/api/query";
import useAuthStore, { Status } from "@/store/auth/authStore";
import { LoaderFunctionArgs, redirect } from "react-router";

// just normal loader with axios
// export const homeLoader = async () => {
//   try {
//     const products = await api.get("/users/infinite/products?limit=8");
//     const posts = await api.get("/users/posts/infinite?limit=3");

//     // const [products, posts] = await Promise.all([
//     //   api.get("/users/infinite/products?limit=8"),
//     //   api.get("/users/posts/infinite?limit=3"),
//     // ]);

//     return {
//       productData: products.data,
//       postData: posts.data,
//     };
//   } catch (error) {
//     console.log("HomeLoader error: ", error);
//   }
// };

export const homeLoader = async () => {
  // loader with react query and cache data
  await queryClient.ensureQueryData(productQuery("?limit=8"));
  await queryClient.ensureQueryData(postQuery("?limit=3"));

  return null;
};

export const loginLoader = async () => {
  try {
    const response = await authApi.get("/auth-check");
    if (response.status !== 200) {
      return null;
    }
    return redirect("/");
  } catch (error) {
    console.log("LoginLoader error: ", error);
  }
};

export const otpLoader = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.status !== Status.otp) {
    return redirect("/register");
  }

  return null;
};

export const confirmPasswordLoader = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.status !== Status.confirm) {
    return redirect("/register");
  }
  return null;
};

// 1. Login success  -->  loader (fetching data)  -->  Home Screen
// 2. Login success  -->  Home Screen  -->  useQuery (cache after fetch)
// 3. Login success  -->  loader (cache after fetch) --> Home screen

export const blogInfiniteLoader = async () => {
  await queryClient.ensureInfiniteQueryData(postInfiniteQuery());
  return null;
};

export const postDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.postId) {
    throw new Error("No Post ID provided!");
  }

  await queryClient.ensureQueryData(postQuery("?limit=6"));
  await queryClient.ensureQueryData(onePostQuery(Number(params.postId)));

  return { postId: params.postId };
};
