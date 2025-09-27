import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home";
import RootLayout from "./pages/RootLayout";
import AboutPage from "./pages/About";
import ErrorPage from "./pages/Error";
import { lazy, Suspense } from "react";

// Blogs
// import BlogPage from "./pages/blogs/Blog";
// import BlogDetailPage from "./pages/blogs/BlogDetail";
// import BlogRootLayoutPage from "./pages/blogs/BlogRootLayout";

// Blogs lazy loading
const BlogRootLayoutPage = lazy(() => import("./pages/blogs/BlogRootLayout"));
const BlogPage = lazy(() => import("./pages/blogs/Blog"));
const BlogDetailPage = lazy(() => import("./pages/blogs/BlogDetail"));

// Products
import ProductRootLayoutPage from "./pages/products/ProductRootLayout";
import ProductPage from "./pages/products/Product";
import ProductDetailPage from "./pages/products/ProductDetail";
import SuspenseFallback from "./components/loading/SuspenseFallback";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "blogs",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <BlogRootLayoutPage />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogPage />
              </Suspense>
            ),
          },
          {
            path: ":postId",
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BlogDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "products",
        element: <ProductRootLayoutPage />,
        children: [
          {
            index: true,
            element: <ProductPage />,
          },
          {
            path: ":productId",
            element: <ProductDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);
