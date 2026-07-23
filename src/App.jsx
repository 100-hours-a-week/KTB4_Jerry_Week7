import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import MakePostPage from "./pages/MakePostPage";
import EditPostPage from "./pages/EditPostPage";
import EditProfilePage from "./pages/EditProfilePage";
import EditPasswordPage from "./pages/EditPasswordPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<PostListPage />} />
          <Route path="/posts/new" element={<MakePostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/posts/:id/edit" element={<EditPostPage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/password" element={<EditPasswordPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
