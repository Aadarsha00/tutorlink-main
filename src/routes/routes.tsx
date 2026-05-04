import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/authentication/login-page";
import { RegisterPage } from "../pages/authentication/register-page";
import { ActivationPage } from "../pages/authentication/activation-page";
import { PasswordResetPage } from "../pages/authentication/password-reset-page";
import { PasswordResetConfirmPage } from "../pages/authentication/password-reset-confirm-page";
import { ProtectedRoute, RoleProtectedRoute } from "./protected-route";

import { ParentDashboard } from "@/pages/dashboard/parent/parent-dashboard";
import { TeacherDashboard } from "@/pages/dashboard/teacher/teacher-dashboard";
import AdminDashboard from "@/pages/dashboard/admin/admin-dashboard";
import DashboardRedirect from "./dashboard-redirect";
import GigsPage from "@/pages/gig";
import GigDetailPage from "@/pages/gig/gig-detail";
import { ProfileSetupRedirect } from "./profile-setup-redirect";
import { TeacherProfileSetupPage } from "@/pages/dashboard/teacher/teacher-profile-setup";
import ParentProfileSetup from "@/pages/dashboard/parent/parent-profile-setup-page";
import { ProfileRequiredRoute } from "./profile-required-route";
import CreateGigPage from "@/pages/gig/create-gig";
import NotificationsPage from "@/components/notifications/notification-component";
import ParentGigApplicationsPage from "@/pages/gig/parent-gig-application-page";
import { DashboardLayout } from "@/layout/dashboard-layout";
import { AdminDocumentVerification } from "@/pages/dashboard/admin/admin-document-verification";
import ParentMyGigs from "@/pages/gig/parent-my-gigs";
import ParentDocumentManagement from "@/pages/dashboard/parent/parent-document-management";
import { TeacherDocumentManagement } from "@/pages/dashboard/teacher/teacher-document-management";
import TeacherMyApplications from "@/pages/dashboard/teacher/teacher-my-applications";
import ProfileSettingsPage from "@/pages/dashboard/profile";
import AdminGigs from "@/pages/dashboard/admin/admin-gigs";
import AdminAllUsersPage from "@/pages/dashboard/admin/admin-all-users";
import AdminTeachersPage from "@/pages/dashboard/admin/admin-teachers";
import AdminParentsPage from "@/pages/dashboard/admin/admin-parents";
import PremiumPage from "@/pages/payments/premium-page";
import { PaymentVerificationPage } from "@/pages/payments/gig-payment-verification-page";
import PremiumVerifyPage from "@/pages/payments/premium-verify-page";
import AdminActiveGigs from "@/pages/dashboard/admin/admin-active-gigs";
import AdminDisputedGigs from "@/pages/dashboard/admin/admin-reported-gigs";
import EditGigPage from "@/pages/gig/edit-gig";
import { Home } from "@/pages/Home";
import { AboutUS } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { TutorsPage } from "@/pages/Tutors";
import { useAuth } from "@/hooks/useAuth";

function TeacherGigsRoute() {
  const { user } = useAuth();

  if (user?.role === "parent") {
    return <Navigate to="/parent/gigs" replace />;
  }

  return (
    <RoleProtectedRoute allowedRoles={["teacher"]}>
      <DashboardLayout>
        <GigsPage />
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/activate/:uid/:token" element={<ActivationPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route
        path="/password/reset/confirm/:uid/:token"
        element={<PasswordResetConfirmPage />}
      />

      {/* Profile Setup Routes - Accessible only to users without profiles */}
      <Route
        path="/profile/teacher/setup"
        element={
          <ProfileSetupRedirect>
            <TeacherProfileSetupPage />
          </ProfileSetupRedirect>
        }
      />
      <Route
        path="/profile/parent/setup"
        element={
          <ProfileSetupRedirect>
            <ParentProfileSetup />
          </ProfileSetupRedirect>
        }
      />

      {/* Protected Routes - Require authentication AND profile */}
      {/* Dashboard redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRedirect />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfileSettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Parent dashboard */}
      <Route
        path="/parent/dashboard"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <ParentDashboard />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/create-gig"
        element={
          <ProtectedRoute>
            <ProfileRequiredRoute>
              <RoleProtectedRoute allowedRoles={["parent"]}>
                <DashboardLayout>
                  <CreateGigPage />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProfileRequiredRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gigs/:id/edit"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <EditGigPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/gigs/:id/edit"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <EditGigPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/gigs"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <ParentMyGigs />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/gig/:gigId/applications"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <ParentGigApplicationsPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/gig/verify/"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <PaymentVerificationPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/documents"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <ParentDocumentManagement />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Teacher dashboard */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["teacher"]}>
              <DashboardLayout>
                <TeacherDashboard />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/documents"
        element={
          <ProtectedRoute>
            <ProfileRequiredRoute>
              <RoleProtectedRoute allowedRoles={["teacher"]}>
                <DashboardLayout>
                  <TeacherDocumentManagement />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProfileRequiredRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/applications"
        element={
          <ProtectedRoute>
            <ProfileRequiredRoute>
              <RoleProtectedRoute allowedRoles={["teacher"]}>
                <DashboardLayout>
                  <TeacherMyApplications />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProfileRequiredRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/premium"
        element={
          <ProtectedRoute>
            <ProfileRequiredRoute>
              <RoleProtectedRoute allowedRoles={["teacher"]}>
                <DashboardLayout>
                  <PremiumPage />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProfileRequiredRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/premium/verify"
        element={
          <ProtectedRoute>
            <ProfileRequiredRoute>
              <RoleProtectedRoute allowedRoles={["teacher"]}>
                <DashboardLayout>
                  <PremiumVerifyPage />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProfileRequiredRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin dashboard */}
      <Route
        path="admin/dashboard/"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/documents"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminDocumentVerification />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/gigs"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminGigs />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/gigs/active"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminActiveGigs />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/gigs/disputed"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminDisputedGigs />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/users"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminAllUsersPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/users/teachers"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminTeachersPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/users/parents"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminParentsPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/gigs"
        element={
          <ProfileRequiredRoute>
            <TeacherGigsRoute />
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/gigs/:id"
        element={
          <ProfileRequiredRoute>
            <DashboardLayout>
              <GigDetailPage />
            </DashboardLayout>
          </ProfileRequiredRoute>
        }
      />
      <Route
        path="/parent/gigs/:id"
        element={
          <ProfileRequiredRoute>
            <RoleProtectedRoute allowedRoles={["parent"]}>
              <DashboardLayout>
                <GigDetailPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          </ProfileRequiredRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutUS />} />
      <Route path="/tutor" element={<TutorsPage />} />
      <Route path="/contact" element={<Contact />} />

      {/* 404 */}
      {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
    </Routes>
  );
}

export default App;
