import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import CreateRequest from './pages/CreateRequest';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />

        {/* Shared */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileSettings />} />

        {/* Employee */}
        <Route path="/my-requests" element={<Dashboard />} />
        <Route path="/create" element={<CreateRequest />} />

        {/* Approver */}
        <Route path="/approvals" element={<Dashboard />} />
        <Route path="/analytics" element={<AdminAnalytics />} />

        {/* Admin */}
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
