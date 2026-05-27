import { Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/public/Home";
import Register from "../pages/public/Register";
import Login from "../pages/public/Login";
import GetOtp from "../pages/public/GetOtp";
import AdWatch from "../pages/ads/AdWatch";
import AdPreview from "../pages/ads/AdPreview";
import OtpVerification from "../pages/otp/OtpVerification";
import GenerateOtp from "../pages/otp/GenerateOtp";
import LinkComplete from "../pages/otp/LinkComplete";
import Dashboard from "../pages/portal/Dashboard";
import Offers from "../pages/portal/Offers";
import Recommendations from "../pages/portal/Recommendations";
import Profile from "../pages/portal/Profile";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminHome from "../pages/admin/AdminHome";
import Campaigns from "../pages/admin/Campaigns";
import Users from "../pages/admin/Users";
import Analytics from "../pages/admin/Analytics";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/get-otp" element={<GetOtp />} />
        <Route path="/ad-watch" element={<AdWatch />} />
        <Route path="/ad-preview/:token" element={<AdPreview />} />
        <Route path="/generate-otp" element={<GenerateOtp />} />
        <Route path="/otp-confirmation" element={<GenerateOtp />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/link-complete" element={<LinkComplete />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedRoute>
              <Offers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
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
      </Route>

      <Route
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/campaigns" element={<Campaigns />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}
