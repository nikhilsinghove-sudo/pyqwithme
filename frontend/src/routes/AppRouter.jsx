import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "../components/layout/PublicLayout.jsx";
import { AdminLayout } from "../components/layout/AdminLayout.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { AdminAnalytics } from "../pages/admin/AdminAnalytics.jsx";
import { AdminDashboard } from "../pages/admin/AdminDashboard.jsx";
import { AdminLogin } from "../pages/admin/AdminLogin.jsx";
import { AdminSettings } from "../pages/admin/AdminSettings.jsx";
import { AdminBranding } from "../pages/admin/AdminBranding.jsx";
import { AdminPoems } from "../pages/admin/AdminPoems.jsx";
import { PendingUploads } from "../pages/admin/PendingUploads.jsx";
import { ApprovedPapers } from "../pages/admin/ApprovedPapers.jsx";
import { AdminReports } from "../pages/admin/AdminReports.jsx";
import { Home } from "../pages/Home.jsx";
import Categories from "../pages/Categories.jsx";
import { ManageUpload } from "../pages/ManageUpload.jsx";
import { NotFound } from "../pages/NotFound.jsx";
import { PaperDetails } from "../pages/PaperDetails.jsx";
import { SearchResults } from "../pages/SearchResults.jsx";
import { UploadPage } from "../pages/UploadPage.jsx";
import { AboutUs } from "../pages/AboutUs.jsx";
import { ContactUs } from "../pages/ContactUs.jsx";
import { PrivacyPolicy } from "../pages/PrivacyPolicy.jsx";
import { TermsConditions } from "../pages/TermsConditions.jsx";
import { Disclaimer } from "../pages/Disclaimer.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: <SearchResults /> },
      { path: "categories", element: <Categories /> },
      { path: "papers/:id", element: <PaperDetails /> },
      { path: "upload", element: <UploadPage /> },
      { path: "manage-upload", element: <ManageUpload /> },
      { path: "about", element: <AboutUs /> },
      { path: "contact", element: <ContactUs /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "terms", element: <TermsConditions /> },
      { path: "disclaimer", element: <Disclaimer /> }
    ]
  },
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "pending", element: <PendingUploads /> },
      { path: "approved", element: <ApprovedPapers /> },
      { path: "branding", element: <AdminBranding /> },
      { path: "poems", element: <AdminPoems /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "reports", element: <AdminReports /> },
      { path: "settings", element: <AdminSettings /> }
    ]
  },
  { path: "*", element: <NotFound /> }
]);
