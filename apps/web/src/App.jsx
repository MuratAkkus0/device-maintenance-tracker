import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import NotFoundPage from "./components/NotFoundPage";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import DashboardView from "./views/DashboardView";
import DevicesView from "./views/DevicesView";
import DeviceFormView from "./views/DeviceFormView";
import StaffView from "./views/StaffView";
import RoomsView from "./views/RoomsView";

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" />

      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardView />} />
            <Route path="/devices" element={<DevicesView />} />
            <Route path="/staff" element={<StaffView />} />
            <Route path="/rooms" element={<RoomsView />} />

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/devices/new" element={<DeviceFormView />} />
              <Route path="/devices/:id/edit" element={<DeviceFormView />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
