import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home";
import RootLayout from "./pages/RootLayout";
import AboutPage from "./pages/About";
import ErrorPage from "./pages/Error";

// Blogs
import BlogPage from "./pages/blogs/Blog";
import BlogDetailPage from "./pages/blogs/BlogDetail";
import BlogRootLayoutPage from "./pages/blogs/BlogRootLayout";

// Products
import ProductRootLayout from "./pages/products/ProductRootLayout";
import ProductPage from './pages/products/Products';
import ProductDetailPage from "./pages/products/ProductDetail";

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
        element: <BlogRootLayoutPage />,
        children: [
          {
            index: true,
            element: <BlogPage />,
          },
          {
            path: ":postId",
            element: <BlogDetailPage />,
          },
        ],
      },
      {
        path: "products",
        element: <ProductRootLayout />,
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
]);
