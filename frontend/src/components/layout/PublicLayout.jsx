import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../../api/axiosClient.js";
import { Footer } from "./Footer.jsx";
import { Navbar } from "./Navbar.jsx";
import { PoemTicker } from "./PoemTicker.jsx";

export function PublicLayout() {
  useEffect(() => {
    const visitorId = localStorage.getItem("pyq_visitor_id");
    api.post("/analytics/visitors", { visitorId, path: window.location.pathname }).then(({ data }) => {
      localStorage.setItem("pyq_visitor_id", data.visitorId);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <PoemTicker />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
