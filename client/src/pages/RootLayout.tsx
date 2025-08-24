import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
     <div className="flex min-h-screen flex-col overflow-hidden">
      <main className="mt-16 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
