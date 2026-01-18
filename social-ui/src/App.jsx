import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Feed from "./pages/Feed";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
