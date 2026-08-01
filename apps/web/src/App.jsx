import AddItemView from "./views/AddItemView";
import AddPersonalView from "./views/AddPersonalView";
import DashboardView from "./views/DashboardView";
import AddRoomView from "./views/AddRoomView";
import { Routes, Route } from "react-router-dom";
import NotFoundPage from "./components/NotFoundPage";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/add-item" element={<AddItemView />} />
        <Route path="/add-personal" element={<AddPersonalView />} />
        <Route path="/add-room" element={<AddRoomView />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
