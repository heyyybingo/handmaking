import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import CraftsPage from '@/pages/crafts';
import CategoriesPage from '@/pages/categories';
import CommentsPage from '@/pages/comments';
import IntentsPage from '@/pages/intents';
import ConfigPage from '@/pages/config';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="crafts" element={<CraftsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="comments" element={<CommentsPage />} />
        <Route path="intents" element={<IntentsPage />} />
        <Route path="config" element={<ConfigPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
