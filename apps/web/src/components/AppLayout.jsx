import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <div className="view-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
