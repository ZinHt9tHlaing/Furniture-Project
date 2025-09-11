import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="mt-16 flex-1 md:px-0 lg:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
