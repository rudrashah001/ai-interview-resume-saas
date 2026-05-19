import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Resumes from './pages/Resumes.jsx';
import ResumeEditor from './pages/ResumeEditor.jsx';
import Interviews from './pages/Interviews.jsx';
import InterviewSession from './pages/InterviewSession.jsx';
import Chat from './pages/Chat.jsx';
import Admin from './pages/Admin.jsx';
import Pricing from './pages/Pricing.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx';
import Profile from './pages/Profile.jsx';
import PremiumTools from './pages/PremiumTools.jsx';
import BillingSuccess from './pages/BillingSuccess.jsx';
import BillingCancel from './pages/BillingCancel.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <Resumes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/:id"
          element={
            <ProtectedRoute>
              <ResumeEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <Interviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviews/:id"
          element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/premium-tools"
          element={
            <ProtectedRoute>
              <PremiumTools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
