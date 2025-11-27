import { createBrowserRouter, redirect } from "react-router";
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
import { homeLoader, loginLoader } from "./router/loader/loaderIndex";
import { loginAction, logoutAction } from "./router/action/actionIndex";
import AuthRootLayout from "./pages/auth/AuthRootLayout";
import SignUpPage from "./pages/auth/SignUp";
import OtpPage from "./pages/auth/OtpPage";
import ConfirmPasswordPage from "./pages/auth/ConfirmPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: homeLoader,
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
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <ProductRootLayoutPage />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <ProductPage />
              </Suspense>
            ),
          },
          {
            path: ":productId",
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <ProductDetailPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    loader: loginLoader,
    action: loginAction,
  },
  {
    path: "/register",
    element: <AuthRootLayout />,
    children: [
      {
        index: true,
        element: <SignUpPage />,
      },
      {
        path: "otp",
        element: <OtpPage />,
      },
      {
        path: "confirm-password",
        element: <ConfirmPasswordPage />,
      },
    ],
  },
  {
    path: "/logout",
    action: logoutAction,
    loader: () => redirect("/"),
  },
]);
