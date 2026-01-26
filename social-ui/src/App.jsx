import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Feed from "./pages/Feed";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import PostPage from "./pages/PostPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />

        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Navbar />
              <Notifications />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
