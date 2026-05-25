import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppShell() {
  return (
    <div className="page-bg mesh-bg min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
